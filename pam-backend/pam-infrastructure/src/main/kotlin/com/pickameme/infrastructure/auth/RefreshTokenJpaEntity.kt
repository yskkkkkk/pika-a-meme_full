package com.pickameme.infrastructure.auth

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "refresh_tokens")
class RefreshTokenJpaEntity(
    @Id
    val jti: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "expires_at", nullable = false)
    val expiresAt: LocalDateTime,

    @Column(nullable = false)
    var revoked: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime
)
