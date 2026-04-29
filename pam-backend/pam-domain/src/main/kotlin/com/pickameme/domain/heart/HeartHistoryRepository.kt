package com.pickameme.domain.heart

import java.util.UUID

interface HeartHistoryRepository {
    fun save(history: HeartHistory): HeartHistory
    fun findAllByUserId(userId: UUID): List<HeartHistory>
}
