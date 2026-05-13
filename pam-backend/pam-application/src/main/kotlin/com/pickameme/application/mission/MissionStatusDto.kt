package com.pickameme.application.mission

import com.pickameme.domain.mission.MissionType
import java.time.LocalDateTime

enum class MissionStatus { ACTIVE, PROGRESS, DONE }

data class ProgressDto(val current: Int, val total: Int)

data class MissionStatusDto(
    val id: String,
    val type: MissionType,
    val title: String,
    val description: String,
    val rewardAmount: Int,
    val isHidden: Boolean,
    val status: MissionStatus,
    val progress: ProgressDto?,
    val completedAt: LocalDateTime?,
    val periodKey: String?
)
