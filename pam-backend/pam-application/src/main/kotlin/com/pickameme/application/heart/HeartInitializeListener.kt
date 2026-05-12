package com.pickameme.application.heart

import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartRepository
import com.pickameme.domain.user.UserRegisteredEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class HeartInitializeListener(
    private val heartRepository: HeartRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // 회원가입 트랜잭션 커밋 후 BASIC 하트 5개 + SPECIAL 하트 1개 지급
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onUserRegistered(event: UserRegisteredEvent) {
        val basicHeart = Heart.createBasic(event.userId)
        heartRepository.save(basicHeart)
        log.info("BASIC 하트 초기화 완료: userId=${event.userId}, count=${basicHeart.count}")

        val specialHeart = Heart.createSpecial(event.userId)
        specialHeart.grant(1)
        heartRepository.save(specialHeart)
        log.info("SPECIAL 하트 1개 지급 완료 (웰컴 보상): userId=${event.userId}")
    }
}
