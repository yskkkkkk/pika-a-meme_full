package com.pickameme.domain.heart

import java.util.UUID

interface HeartRepository {
    fun findByUserIdAndType(userId: UUID, type: HeartType): Heart?
    fun findAllByUserId(userId: UUID): List<Heart>
    fun save(heart: Heart): Heart
}
