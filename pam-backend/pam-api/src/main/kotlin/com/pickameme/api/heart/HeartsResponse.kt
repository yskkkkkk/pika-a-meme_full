package com.pickameme.api.heart

import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartType
import java.time.LocalDateTime

data class HeartsResponse(
    val basic: HeartStatus,
    val special: HeartStatus
) {
    data class HeartStatus(
        val count: Int,
        val max: Int?,
        val nextChargeAt: LocalDateTime?
    )

    companion object {
        fun from(hearts: List<Heart>): HeartsResponse {
            val basic = hearts.find { it.type == HeartType.BASIC }
            val special = hearts.find { it.type == HeartType.SPECIAL }
            return HeartsResponse(
                basic = basic?.toBasicStatus() ?: HeartStatus(0, Heart.MAX_BASIC_COUNT, null),
                special = special?.toSpecialStatus() ?: HeartStatus(0, null, null)
            )
        }

        private fun Heart.toBasicStatus(): HeartStatus {
            val nextChargeAt = if (count < Heart.MAX_BASIC_COUNT) {
                lastChargedAt?.plusMinutes(Heart.CHARGE_INTERVAL_MINUTES)
            } else null
            return HeartStatus(count = count, max = Heart.MAX_BASIC_COUNT, nextChargeAt = nextChargeAt)
        }

        private fun Heart.toSpecialStatus() =
            HeartStatus(count = count, max = null, nextChargeAt = null)
    }
}
