package com.pickameme.domain.mission

import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

data class MissionVisitStreak(
    val userId: UUID,
    val currentStreak: Int,
    val lastVisitDate: LocalDate?,
    val updatedAt: LocalDateTime
)
