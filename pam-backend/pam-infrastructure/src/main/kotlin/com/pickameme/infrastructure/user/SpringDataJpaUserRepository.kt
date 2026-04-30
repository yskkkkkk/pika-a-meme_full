package com.pickameme.infrastructure.user

import com.pickameme.domain.user.OAuthProvider
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SpringDataJpaUserRepository : JpaRepository<UserJpaEntity, UUID> {
    fun findByEmail(email: String): UserJpaEntity?
    fun findByProviderAndProviderId(provider: OAuthProvider, providerId: String): UserJpaEntity?
}
