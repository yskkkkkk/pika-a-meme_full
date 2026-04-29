package com.pickameme.domain.heart

import java.time.LocalDateTime
import java.util.UUID

class HeartHistory(
    val id: UUID,
    val userId: UUID,
    val heartType: HeartType,
    val action: HeartAction,
    val amount: Int,
    val occurredAt: LocalDateTime,
    val referenceId: UUID? // 밈 생성 시 memeId 연결
) {
    companion object {
        fun consume(userId: UUID, heartType: HeartType, memeId: UUID? = null): HeartHistory =
            HeartHistory(
                id = UUID.randomUUID(),
                userId = userId,
                heartType = heartType,
                action = HeartAction.CONSUME,
                amount = 1,
                occurredAt = LocalDateTime.now(),
                referenceId = memeId
            )

        fun charge(userId: UUID, amount: Int): HeartHistory =
            HeartHistory(
                id = UUID.randomUUID(),
                userId = userId,
                heartType = HeartType.BASIC,
                action = HeartAction.CHARGE,
                amount = amount,
                occurredAt = LocalDateTime.now(),
                referenceId = null
            )

        fun grant(userId: UUID, amount: Int): HeartHistory =
            HeartHistory(
                id = UUID.randomUUID(),
                userId = userId,
                heartType = HeartType.SPECIAL,
                action = HeartAction.GRANT,
                amount = amount,
                occurredAt = LocalDateTime.now(),
                referenceId = null
            )
    }
}
