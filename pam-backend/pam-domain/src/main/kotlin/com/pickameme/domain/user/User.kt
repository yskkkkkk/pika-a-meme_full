package com.pickameme.domain.user

import java.time.LocalDateTime
import java.util.UUID

class User(
    val id: UUID,
    val username: String,
    val email: String,
    val createdAt: LocalDateTime,
    var updatedAt: LocalDateTime
) {
    companion object {
        fun create(username: String, email: String): User {
            require(username.isNotBlank()) { "Username must not be blank" }
            require(email.isNotBlank()) { "Email must not be blank" }
            require(email.contains("@")) { "Email must be valid" }

            val now = LocalDateTime.now()
            return User(
                id = UUID.randomUUID(),
                username = username,
                email = email,
                createdAt = now,
                updatedAt = now
            )
        }
    }
}
