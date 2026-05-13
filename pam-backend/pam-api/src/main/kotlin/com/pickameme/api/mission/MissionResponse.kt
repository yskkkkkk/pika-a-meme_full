package com.pickameme.api.mission

import com.pickameme.application.mission.MissionStatus
import com.pickameme.application.mission.MissionStatusDto
import com.pickameme.domain.mission.MissionType
import java.time.LocalDateTime

data class ProgressResponse(val current: Int, val total: Int)

data class MissionResponse(
    val id: String,
    val type: MissionType,
    val title: String,
    val description: String,
    val rewardAmount: Int,
    val isHidden: Boolean,
    val status: MissionStatus,
    val progress: ProgressResponse?,
    val completedAt: LocalDateTime?,
    val periodKey: String?
) {
    companion object {
        fun from(dto: MissionStatusDto) = MissionResponse(
            id = dto.id,
            type = dto.type,
            title = dto.title,
            description = dto.description,
            rewardAmount = dto.rewardAmount,
            isHidden = dto.isHidden,
            status = dto.status,
            progress = dto.progress?.let { ProgressResponse(it.current, it.total) },
            completedAt = dto.completedAt,
            periodKey = dto.periodKey
        )
    }
}
