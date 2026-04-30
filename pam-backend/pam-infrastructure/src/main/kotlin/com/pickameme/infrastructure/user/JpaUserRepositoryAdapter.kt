package com.pickameme.infrastructure.user

import com.pickameme.domain.user.OAuthProvider
import com.pickameme.domain.user.User
import com.pickameme.domain.user.UserRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaUserRepositoryAdapter(
    private val jpaRepository: SpringDataJpaUserRepository
) : UserRepository {

    override fun save(user: User): User =
        jpaRepository.save(user.toEntity()).toDomain()

    override fun findById(id: UUID): User? =
        jpaRepository.findById(id).map { it.toDomain() }.orElse(null)

    override fun findByEmail(email: String): User? =
        jpaRepository.findByEmail(email)?.toDomain()

    override fun findByProviderAndProviderId(provider: OAuthProvider, providerId: String): User? =
        jpaRepository.findByProviderAndProviderId(provider, providerId)?.toDomain()

    private fun User.toEntity() = UserJpaEntity(
        id = id,
        username = username,
        email = email,
        provider = provider,
        providerId = providerId,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    private fun UserJpaEntity.toDomain() = User(
        id = id,
        username = username,
        email = email,
        provider = provider,
        providerId = providerId,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
