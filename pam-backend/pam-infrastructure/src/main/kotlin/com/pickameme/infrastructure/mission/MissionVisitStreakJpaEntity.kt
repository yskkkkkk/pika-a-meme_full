package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.MissionVisitStreak
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "mission_visit_streaks")
class MissionVisitStreakJpaEntity(
    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    val userId: UUID,

    @Column(name = "current_streak", nullable = false)
    var currentStreak: Int,

    @Column(name = "last_visit_date")
    var lastVisitDate: LocalDate?,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain() = MissionVisitStreak(
        userId = userId,
        currentStreak = currentStreak,
        lastVisitDate = lastVisitDate,
        updatedAt = updatedAt
    )

    companion object {
        fun from(streak: MissionVisitStreak) = MissionVisitStreakJpaEntity(
            userId = streak.userId,
            currentStreak = streak.currentStreak,
            lastVisitDate = streak.lastVisitDate,
            updatedAt = streak.updatedAt
        )
    }
}
