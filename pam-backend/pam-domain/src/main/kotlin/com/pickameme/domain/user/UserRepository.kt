package com.pickameme.domain.user

import java.util.UUID

interface UserRepository {
    fun save(user: User): User
    fun findById(id: UUID): User?
    fun findByEmail(email: String): User?
    fun findByProviderAndProviderId(provider: OAuthProvider, providerId: String): User?
}
