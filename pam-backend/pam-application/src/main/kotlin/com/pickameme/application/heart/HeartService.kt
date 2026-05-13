package com.pickameme.application.heart

import com.pickameme.domain.common.LockManager
import com.pickameme.domain.exception.HeartNotFoundException
import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartHistory
import com.pickameme.domain.heart.HeartHistoryRepository
import com.pickameme.domain.heart.HeartRepository
import com.pickameme.domain.heart.HeartType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class HeartService(
    private val heartRepository: HeartRepository,
    private val heartHistoryRepository: HeartHistoryRepository,
    private val lockManager: LockManager
) {

    // 밈 생성 시 하트 차감. BASIC 은 차감 전 lazy 충전 선수행
    @Transactional
    fun consumeHeart(userId: UUID, heartType: HeartType, memeId: UUID? = null) {
        lockManager.withLock("lock:heart:$userId") {
            val heart = findHeartOrThrow(userId, heartType)
            val preChargeCount = heart.count

            if (heartType == HeartType.BASIC) {
                heart.chargeIfNeeded(LocalDateTime.now())
            }

            heart.consume()
            heartRepository.save(heart)

            heartHistoryRepository.save(HeartHistory.consume(userId, heartType, memeId))

            // BASIC 이 lazy 충전된 경우 충전 이력 기록
            if (heartType == HeartType.BASIC) {
                val chargedAmount = heart.count + 1 - preChargeCount
                if (chargedAmount > 0) {
                    heartHistoryRepository.save(HeartHistory.charge(userId, chargedAmount))
                }
            }
        }
    }

    // SPECIAL 하트 지급 (조건/이벤트 달성)
    @Transactional
    fun grantSpecialHeart(userId: UUID, amount: Int) {
        lockManager.withLock("lock:heart:$userId") {
            val heart = heartRepository.findByUserIdAndType(userId, HeartType.SPECIAL)
                ?: Heart.createSpecial(userId)

            heart.grant(amount)
            heartRepository.save(heart)
            heartHistoryRepository.save(HeartHistory.grant(userId, amount))
        }
    }

    // 유저의 현재 하트 현황 조회 (BASIC lazy 충전 반영)
    @Transactional(readOnly = true)
    fun getHearts(userId: UUID): List<Heart> {
        return heartRepository.findAllByUserId(userId).map { heart ->
            if (heart.type == HeartType.BASIC) heart.chargeIfNeeded(LocalDateTime.now())
            else heart
        }
    }

    private fun findHeartOrThrow(userId: UUID, type: HeartType): Heart =
        heartRepository.findByUserIdAndType(userId, type)
            ?: throw HeartNotFoundException(userId, type)
}
