package com.pickameme.infrastructure.mission

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface SpringDataJpaMissionCompletionRepository : JpaRepository<MissionCompletionJpaEntity, UUID> {

    fun findByUserId(userId: UUID): List<MissionCompletionJpaEntity>

    fun existsByUserIdAndMissionIdAndPeriodKey(userId: UUID, missionId: String, periodKey: String?): Boolean

    @Query("SELECT COUNT(c) FROM MissionCompletionJpaEntity c WHERE c.userId = :userId AND c.missionId = :missionId AND c.periodKey = :periodKey")
    fun countByUserIdAndMissionIdAndPeriodKey(userId: UUID, missionId: String, periodKey: String): Int
}
