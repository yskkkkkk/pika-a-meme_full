package com.pickameme.domain.mission

import java.util.UUID

interface MissionVisitStreakRepository {
    fun findByUserId(userId: UUID): MissionVisitStreak?
    fun save(streak: MissionVisitStreak): MissionVisitStreak
}
