package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.MissionCompletion
import com.pickameme.domain.mission.MissionCompletionRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaMissionCompletionRepositoryAdapter(
    private val jpa: SpringDataJpaMissionCompletionRepository
) : MissionCompletionRepository {

    override fun save(completion: MissionCompletion): MissionCompletion =
        jpa.save(MissionCompletionJpaEntity.from(completion)).toDomain()

    override fun findByUserId(userId: UUID): List<MissionCompletion> =
        jpa.findByUserId(userId).map { it.toDomain() }

    override fun existsByUserIdAndMissionIdAndPeriodKey(userId: UUID, missionId: String, periodKey: String?): Boolean =
        jpa.existsByUserIdAndMissionIdAndPeriodKey(userId, missionId, periodKey)

    override fun countByUserIdAndMissionIdAndPeriodKey(userId: UUID, missionId: String, periodKey: String): Int =
        jpa.countByUserIdAndMissionIdAndPeriodKey(userId, missionId, periodKey)
}
