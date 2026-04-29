package com.pickameme.domain.common

// 분산 락 포트 — infrastructure 에서 Redisson 으로 구현
interface LockManager {
    fun <T> withLock(key: String, block: () -> T): T
}
