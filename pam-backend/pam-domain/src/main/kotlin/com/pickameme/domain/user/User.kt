package com.pickameme.domain.user

import java.time.LocalDateTime
import java.util.UUID

class User(
    val id: UUID,
    val username: String,
    val email: String,
    val provider: OAuthProvider,
    val providerId: String,
    val createdAt: LocalDateTime,
    var updatedAt: LocalDateTime
) {
    companion object {
        fun createByOAuth2(
            username: String,
            email: String,
            provider: OAuthProvider,
            providerId: String
        ): User {
            require(username.isNotBlank()) { "Username must not be blank" }
            require(email.isNotBlank()) { "Email must not be blank" }

            val now = LocalDateTime.now()
            return User(
                id = UUID.randomUUID(),
                username = username,
                email = email,
                provider = provider,
                providerId = providerId,
                createdAt = now,
                updatedAt = now
            )
        }
    }
}
