package com.pickameme.infrastructure.user

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "users")
class UserJpaEntity(
    @Id
    val id: UUID,

    @Column(nullable = false)
    val username: String,

    @Column(nullable = false, unique = true)
    val email: String,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime,

    @Column(nullable = false)
    var updatedAt: LocalDateTime
)
