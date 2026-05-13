package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.MissionShareLog
import com.pickameme.domain.mission.MissionShareLogRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.time.temporal.WeekFields
import java.util.UUID

@Repository
class JpaMissionShareLogRepositoryAdapter(
    private val jpa: SpringDataJpaMissionShareLogRepository
) : MissionShareLogRepository {

    override fun save(log: MissionShareLog): MissionShareLog =
        jpa.save(MissionShareLogJpaEntity.from(log)).toDomain()

    // periodKey = 'YYYY-Www' (ISO week), e.g. '2026-W20'
    override fun countByUserIdAndPeriodKey(userId: UUID, periodKey: String): Int {
        val (from, to) = isoWeekBounds(periodKey)
        return jpa.countByUserIdAndSharedAtBetween(userId, from, to)
    }

    private fun isoWeekBounds(periodKey: String): Pair<LocalDateTime, LocalDateTime> {
        // periodKey format: '2026-W20'
        val (year, week) = periodKey.split("-W").map { it.toInt() }
        val weekFields = WeekFields.ISO
        val firstDayOfWeek = java.time.LocalDate.now()
            .withYear(year)
            .with(weekFields.weekOfYear(), week.toLong())
            .with(weekFields.dayOfWeek(), 1)
        return firstDayOfWeek.atStartOfDay() to firstDayOfWeek.plusWeeks(1).atStartOfDay()
    }
}
