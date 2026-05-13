package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.MissionShareLog
import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "mission_share_logs")
class MissionShareLogJpaEntity(
    @Id
    @Column(name = "id", columnDefinition = "uuid")
    val id: UUID,

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "share_type", length = 30, nullable = false)
    val shareType: MissionShareLog.ShareType,

    @Column(name = "shared_at", nullable = false)
    val sharedAt: LocalDateTime
) {
    fun toDomain() = MissionShareLog(id = id, userId = userId, shareType = shareType, sharedAt = sharedAt)

    companion object {
        fun from(log: MissionShareLog) = MissionShareLogJpaEntity(
            id = log.id, userId = log.userId, shareType = log.shareType, sharedAt = log.sharedAt
        )
    }
}
