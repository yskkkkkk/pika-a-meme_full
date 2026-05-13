package com.pickameme.domain.mission

import java.util.UUID

interface MissionCompletionRepository {
    fun save(completion: MissionCompletion): MissionCompletion
    fun findByUserId(userId: UUID): List<MissionCompletion>
    fun existsByUserIdAndMissionIdAndPeriodKey(userId: UUID, missionId: String, periodKey: String?): Boolean
    fun countByUserIdAndMissionIdAndPeriodKey(userId: UUID, missionId: String, periodKey: String): Int
}
