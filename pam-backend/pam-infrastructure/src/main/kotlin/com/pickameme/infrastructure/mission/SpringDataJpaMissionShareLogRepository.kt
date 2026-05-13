package com.pickameme.infrastructure.mission

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime
import java.util.UUID

interface SpringDataJpaMissionShareLogRepository : JpaRepository<MissionShareLogJpaEntity, UUID> {

    @Query("SELECT COUNT(s) FROM MissionShareLogJpaEntity s WHERE s.userId = :userId AND s.sharedAt >= :from AND s.sharedAt < :to")
    fun countByUserIdAndSharedAtBetween(userId: UUID, from: LocalDateTime, to: LocalDateTime): Int
}
