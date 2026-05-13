package com.pickameme.domain.mission

import java.time.LocalDateTime
import java.util.UUID

data class MissionCompletion(
    val id: UUID,
    val userId: UUID,
    val missionId: String,
    val completedAt: LocalDateTime,
    val periodKey: String?,         // 'YYYY-Www' | 'YYYY-MM-DD' | null
    val rewardGranted: Int,
    val metadata: Map<String, String>   // {"tag": "귀여움"} 히든 미션 식별용
)
