package com.pickameme.infrastructure.user

import com.pickameme.domain.user.OAuthProvider
import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "users",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["email"]),
        UniqueConstraint(columnNames = ["provider", "provider_id"])
    ]
)
class UserJpaEntity(
    @Id
    val id: UUID,

    @Column(nullable = false, length = 100)
    val username: String,

    @Column(nullable = false, length = 255)
    val email: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    val provider: OAuthProvider,

    @Column(name = "provider_id", nullable = false, length = 255)
    val providerId: String,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime,

    @Column(nullable = false)
    var updatedAt: LocalDateTime
)
