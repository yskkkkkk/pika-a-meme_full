package com.pickameme.infrastructure.lock

import com.pickameme.domain.common.LockManager
import org.redisson.api.RedissonClient
import org.springframework.stereotype.Component
import java.util.concurrent.TimeUnit

@Component
class RedissonLockManager(
    private val redissonClient: RedissonClient
) : LockManager {

    override fun <T> withLock(key: String, block: () -> T): T {
        val lock = redissonClient.getLock(key)
        val acquired = lock.tryLock(5, 10, TimeUnit.SECONDS)
        check(acquired) { "분산 락 획득 실패: key=$key" }
        try {
            return block()
        } finally {
            if (lock.isHeldByCurrentThread) lock.unlock()
        }
    }
}
