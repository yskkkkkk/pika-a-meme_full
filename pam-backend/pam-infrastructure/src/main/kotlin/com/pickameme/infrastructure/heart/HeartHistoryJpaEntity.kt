package com.pickameme.infrastructure.heart

import com.pickameme.domain.heart.HeartAction
import com.pickameme.domain.heart.HeartHistory
import com.pickameme.domain.heart.HeartType
import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "heart_histories")
class HeartHistoryJpaEntity(
    @Id
    @Column(name = "id", columnDefinition = "uuid")
    val id: UUID,

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "heart_type", nullable = false, length = 20)
    val heartType: HeartType,

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    val action: HeartAction,

    @Column(name = "amount", nullable = false)
    val amount: Int,

    @Column(name = "occurred_at", nullable = false)
    val occurredAt: LocalDateTime,

    @Column(name = "reference_id", columnDefinition = "uuid")
    val referenceId: UUID? = null
) {
    fun toDomain(): HeartHistory = HeartHistory(
        id = id,
        userId = userId,
        heartType = heartType,
        action = action,
        amount = amount,
        occurredAt = occurredAt,
        referenceId = referenceId
    )

    companion object {
        fun from(history: HeartHistory): HeartHistoryJpaEntity = HeartHistoryJpaEntity(
            id = history.id,
            userId = history.userId,
            heartType = history.heartType,
            action = history.action,
            amount = history.amount,
            occurredAt = history.occurredAt,
            referenceId = history.referenceId
        )
    }
}
