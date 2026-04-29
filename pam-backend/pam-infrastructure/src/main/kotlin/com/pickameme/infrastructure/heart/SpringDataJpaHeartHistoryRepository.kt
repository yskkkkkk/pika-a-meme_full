package com.pickameme.infrastructure.heart

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SpringDataJpaHeartHistoryRepository : JpaRepository<HeartHistoryJpaEntity, UUID> {
    fun findAllByUserId(userId: UUID): List<HeartHistoryJpaEntity>
}
