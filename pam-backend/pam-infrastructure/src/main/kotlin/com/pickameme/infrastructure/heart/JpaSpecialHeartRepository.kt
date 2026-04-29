package com.pickameme.infrastructure.heart

import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartType
import org.springframework.stereotype.Repository
import java.util.UUID

// SPECIAL 하트의 JPA 구현체
@Repository
class JpaSpecialHeartRepository(
    private val springDataJpa: SpringDataJpaHeartRepository
) {
    fun find(userId: UUID): Heart? =
        springDataJpa.findByUserIdAndType(userId, HeartType.SPECIAL)?.toDomain()

    fun save(heart: Heart): Heart {
        require(heart.type == HeartType.SPECIAL)
        val existing = springDataJpa.findByUserIdAndType(heart.userId, HeartType.SPECIAL)
        val entity = if (existing != null) {
            existing.count = heart.count
            existing
        } else {
            HeartJpaEntity.from(heart)
        }
        return springDataJpa.save(entity).toDomain()
    }
}
