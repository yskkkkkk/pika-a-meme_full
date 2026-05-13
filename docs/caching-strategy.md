# 캐싱 전략 (Spring Cache + Redis)

## 배경

`/api/memes/recent-matched` 엔드포인트는 모든 비로그인/로그인 사용자가 홈 화면 진입 시마다 조회한다.  
결과물이 실시간일 필요가 없고, 매 요청마다 DB를 조회하는 것은 비효율적이므로 **10분 TTL Redis 캐시**를 적용했다.

---

## 구조

```
@Cacheable("recent-matched-memes")   ← AOP 프록시가 가로챔
    ↓ 캐시 미스 시에만 실행
JpaUserMemeRepositoryAdapter.findRecentTagMatched(limit)
    ↓
DB 조회 → 결과를 Redis에 JSON으로 저장
    ↓ 캐시 히트 시
Redis에서 JSON 역직렬화 → 바로 반환 (DB 조회 없음)
```

### 어노테이션 하나로 Redis까지 자동 연결되는 원리

1. `@EnableCaching` (`RedissonConfig`) — Spring이 캐시 AOP 프록시를 활성화
2. `RedisCacheManager` 빈이 등록되어 있으면 Spring이 이것을 기본 `CacheManager`로 사용
3. `@Cacheable("recent-matched-memes")` 선언 시 해당 메서드 호출이 AOP로 가로채짐
4. 캐시 키(`recent-matched-memes::SimpleKey [10]` 등)로 Redis를 먼저 조회
5. 없으면 실제 메서드 실행 후 반환값을 Redis에 JSON 직렬화해서 저장
6. 있으면 JSON 역직렬화 후 바로 반환 — **메서드 본문은 실행되지 않음**

---

## 설정 위치

`pam-infrastructure/src/main/kotlin/com/pickameme/infrastructure/config/RedissonConfig.kt`

```kotlin
@EnableCaching
@Configuration
class RedissonConfig(...) {

    @Bean
    fun cacheManager(redissonClient: RedissonClient): RedisCacheManager {
        val objectMapper = ObjectMapper()
            .registerModule(kotlinModule())
            .registerModule(JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .activateDefaultTyping(            // List<UserMeme> 같은 제네릭 타입 역직렬화를 위해 필요
                BasicPolymorphicTypeValidator.builder()
                    .allowIfBaseType(Any::class.java).build(),
                ObjectMapper.DefaultTyping.NON_FINAL
            )

        val cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))  // TTL: 10분
            .serializeKeysWith(...)
            .serializeValuesWith(GenericJackson2JsonRedisSerializer(objectMapper))

        return RedisCacheManager.builder(redisConnectionFactory(redissonClient))
            .cacheDefaults(cacheConfig).build()
    }
}
```

---

## TTL 정책 결정 근거

| 항목 | 결정 |
|------|------|
| TTL | 10분 |
| 수동 invalidate | 없음 |
| 이유 | 홈 화면 캐러셀은 "최근 완성된 밈 목록"이며 실시간일 필요 없음. 스페셜 가챠가 늘어날수록 10분 내에 자연스럽게 갱신됨. 복잡한 invalidate 로직 없이 TTL 만료에 맡기는 것이 단순하고 충분함. |

---

## 현재 적용된 캐시 목록

| 캐시 이름 | 메서드 | TTL | 설명 |
|-----------|--------|-----|------|
| `recent-matched-memes` | `JpaUserMemeRepositoryAdapter.findRecentTagMatched` | 10분 | 홈 화면 캐러셀용 최근 매칭 밈 |

---

## 주의사항

- **다중 인스턴스 환경 안전**: Redis는 모든 Railway 인스턴스가 공유하므로 캐시 불일치 없음 (in-memory 캐시와의 차이점)
- **`activateDefaultTyping` 필수**: `List<UserMeme>` 같은 제네릭 타입을 역직렬화할 때 타입 메타정보가 JSON에 포함되어야 함. 없으면 `LinkedHashMap`으로 역직렬화되어 `ClassCastException` 발생
- **self-invocation 불가**: 같은 클래스 내에서 `@Cacheable` 메서드를 직접 호출하면 AOP 프록시를 거치지 않아 캐시가 동작하지 않음
