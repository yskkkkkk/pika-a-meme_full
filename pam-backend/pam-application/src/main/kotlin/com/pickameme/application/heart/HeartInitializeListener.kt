package com.pickameme.application.heart

import com.pickameme.domain.user.UserRegisteredEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class HeartInitializeListener {

    private val log = LoggerFactory.getLogger(javaClass)

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onUserRegistered(event: UserRegisteredEvent) {
        // TODO: In Phase 2 or Infrastructure integration, actual Redis commands will go here
        log.info("Initializing 5 hearts in Redis for new user: ${event.userId}")
        // E.g., redisTemplate.opsForValue().set("heart:${event.userId}", "5")
    }
}
