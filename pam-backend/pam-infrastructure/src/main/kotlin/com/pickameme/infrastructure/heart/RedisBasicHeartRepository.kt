package com.pickameme.infrastructure.heart

import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartType
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

// BASIC 하트의 Redis SSOT 구현체
// Key 구조: heart:basic:{userId} → Hash { id, count, lastChargedAt }
@Repository
class RedisBasicHeartRepository(
    private val redisTemplate: RedisTemplate<String, String>
) {
    private val fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    fun find(userId: UUID): Heart? {
        val key = redisKey(userId)
        val hash = redisTemplate.opsForHash<String, String>().entries(key)
        if (hash.isEmpty()) return null

        return Heart(
            id = UUID.fromString(hash["id"]!!),
            userId = userId,
            type = HeartType.BASIC,
            count = hash["count"]!!.toInt(),
            lastChargedAt = hash["lastChargedAt"]?.let { LocalDateTime.parse(it, fmt) }
        )
    }

    fun save(heart: Heart): Heart {
        require(heart.type == HeartType.BASIC)
        val key = redisKey(heart.userId)
        val ops = redisTemplate.opsForHash<String, String>()
        ops.putAll(key, buildMap {
            put("id", heart.id.toString())
            put("count", heart.count.toString())
            heart.lastChargedAt?.let { put("lastChargedAt", it.format(fmt)) }
        })
        return heart
    }

    private fun redisKey(userId: UUID) = "heart:basic:$userId"
}
