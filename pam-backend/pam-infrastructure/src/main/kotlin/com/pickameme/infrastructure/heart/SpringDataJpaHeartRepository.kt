package com.pickameme.infrastructure.heart

import com.pickameme.domain.heart.HeartType
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SpringDataJpaHeartRepository : JpaRepository<HeartJpaEntity, UUID> {
    fun findByUserIdAndType(userId: UUID, type: HeartType): HeartJpaEntity?
    fun findAllByUserId(userId: UUID): List<HeartJpaEntity>
}
