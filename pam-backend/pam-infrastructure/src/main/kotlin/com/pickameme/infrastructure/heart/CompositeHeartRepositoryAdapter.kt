package com.pickameme.infrastructure.heart

import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartRepository
import com.pickameme.domain.heart.HeartType
import org.springframework.stereotype.Component
import java.util.UUID

// HeartRepository 포트 구현체 — 타입에 따라 Redis(BASIC) 또는 JPA(SPECIAL) 로 라우팅
@Component
class CompositeHeartRepositoryAdapter(
    private val redisBasic: RedisBasicHeartRepository,
    private val jpaSpecial: JpaSpecialHeartRepository
) : HeartRepository {

    override fun findByUserIdAndType(userId: UUID, type: HeartType): Heart? = when (type) {
        HeartType.BASIC -> redisBasic.find(userId)
        HeartType.SPECIAL -> jpaSpecial.find(userId)
    }

    override fun findAllByUserId(userId: UUID): List<Heart> {
        val basic = redisBasic.find(userId)
        val special = jpaSpecial.find(userId)
        return listOfNotNull(basic, special)
    }

    override fun save(heart: Heart): Heart = when (heart.type) {
        HeartType.BASIC -> redisBasic.save(heart)
        HeartType.SPECIAL -> jpaSpecial.save(heart)
    }
}
