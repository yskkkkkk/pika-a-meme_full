package com.pickameme.infrastructure.auth

import com.pickameme.domain.auth.RefreshToken
import com.pickameme.domain.auth.RefreshTokenRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaRefreshTokenRepositoryAdapter(
    private val jpaRepository: SpringDataJpaRefreshTokenRepository
) : RefreshTokenRepository {

    override fun save(token: RefreshToken): RefreshToken =
        jpaRepository.save(token.toEntity()).toDomain()

    override fun findByJti(jti: UUID): RefreshToken? =
        jpaRepository.findById(jti).map { it.toDomain() }.orElse(null)

    override fun revokeByJti(jti: UUID) = jpaRepository.revokeByJti(jti)

    override fun revokeAllByUserId(userId: UUID) = jpaRepository.revokeAllByUserId(userId)

    private fun RefreshToken.toEntity() = RefreshTokenJpaEntity(
        jti = jti,
        userId = userId,
        expiresAt = expiresAt,
        revoked = revoked,
        createdAt = createdAt
    )

    private fun RefreshTokenJpaEntity.toDomain() = RefreshToken(
        jti = jti,
        userId = userId,
        expiresAt = expiresAt,
        revoked = revoked,
        createdAt = createdAt
    )
}
