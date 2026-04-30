package com.pickameme.domain.heart

import com.pickameme.domain.exception.InsufficientHeartException
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID

class Heart(
    val id: UUID,
    val userId: UUID,
    val type: HeartType,
    var count: Int,
    var lastChargedAt: LocalDateTime? // BASIC 전용, SPECIAL 은 null
) {
    companion object {
        const val MAX_BASIC_COUNT = 5
        const val CHARGE_INTERVAL_MINUTES = 5L

        fun createBasic(userId: UUID): Heart = Heart(
            id = UUID.randomUUID(),
            userId = userId,
            type = HeartType.BASIC,
            count = MAX_BASIC_COUNT,
            lastChargedAt = LocalDateTime.now()
        )

        fun createSpecial(userId: UUID): Heart = Heart(
            id = UUID.randomUUID(),
            userId = userId,
            type = HeartType.SPECIAL,
            count = 0,
            lastChargedAt = null
        )
    }

    fun consume() {
        if (count <= 0) throw InsufficientHeartException(userId, type)
        count--
    }

    // BASIC 하트 전용: 소모 시점에 lazy 충전 계산 후 반영
    fun chargeIfNeeded(now: LocalDateTime): Heart {
        require(type == HeartType.BASIC) { "BASIC 하트만 자동 충전됩니다." }

        val baseline = lastChargedAt ?: return this
        if (count >= MAX_BASIC_COUNT) return this

        val minutesPassed = ChronoUnit.MINUTES.between(baseline, now)
        val heartsToAdd = (minutesPassed / CHARGE_INTERVAL_MINUTES).toInt()

        if (heartsToAdd > 0) {
            count = minOf(count + heartsToAdd, MAX_BASIC_COUNT)
            lastChargedAt = baseline.plusMinutes(heartsToAdd * CHARGE_INTERVAL_MINUTES)
        }

        return this
    }

    // SPECIAL 하트 전용: 이벤트/조건 달성 시 지급
    fun grant(amount: Int) {
        require(type == HeartType.SPECIAL) { "SPECIAL 하트만 직접 지급 가능합니다." }
        require(amount > 0) { "지급량은 1 이상이어야 합니다." }
        count += amount
    }
}
