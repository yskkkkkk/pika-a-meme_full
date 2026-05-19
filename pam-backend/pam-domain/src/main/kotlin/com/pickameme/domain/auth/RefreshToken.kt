package com.pickameme.domain.auth

import java.time.LocalDateTime
import java.util.UUID

data class RefreshToken(
    val jti: UUID,
    val userId: UUID,
    val expiresAt: LocalDateTime,
    val revoked: Boolean,
    val createdAt: LocalDateTime
)
