package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.MissionCompletion
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "mission_completions",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "mission_id", "period_key"])]
)
class MissionCompletionJpaEntity(
    @Id
    @Column(name = "id", columnDefinition = "uuid")
    val id: UUID,

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    val userId: UUID,

    @Column(name = "mission_id", length = 60, nullable = false)
    val missionId: String,

    @Column(name = "completed_at", nullable = false)
    val completedAt: LocalDateTime,

    @Column(name = "period_key", length = 20)
    val periodKey: String?,

    @Column(name = "reward_granted", nullable = false)
    val rewardGranted: Int,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    val metadata: Map<String, String> = emptyMap()
) {
    fun toDomain() = MissionCompletion(
        id = id,
        userId = userId,
        missionId = missionId,
        completedAt = completedAt,
        periodKey = periodKey,
        rewardGranted = rewardGranted,
        metadata = metadata
    )

    companion object {
        fun from(c: MissionCompletion) = MissionCompletionJpaEntity(
            id = c.id,
            userId = c.userId,
            missionId = c.missionId,
            completedAt = c.completedAt,
            periodKey = c.periodKey,
            rewardGranted = c.rewardGranted,
            metadata = c.metadata
        )
    }
}
