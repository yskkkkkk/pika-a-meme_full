package com.pickameme.api.auth

import com.pickameme.domain.auth.RefreshToken
import com.pickameme.domain.auth.RefreshTokenRepository
import com.pickameme.infrastructure.auth.JwtProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

data class RotateResult(val userId: UUID, val newAccessToken: String, val newRefreshJwt: String)

@Service
class RefreshTokenService(
    private val refreshTokenRepository: RefreshTokenRepository,
    private val jwtProvider: JwtProvider,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long
) {

    @Transactional
    fun issue(userId: UUID): String {
        val jti = UUID.randomUUID()
        val expiresAt = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000)
        refreshTokenRepository.save(
            RefreshToken(
                jti = jti,
                userId = userId,
                expiresAt = expiresAt,
                revoked = false,
                createdAt = LocalDateTime.now()
            )
        )
        return jwtProvider.generateRefreshToken(userId, jti)
    }

    @Transactional
    fun rotate(oldRefreshToken: String): RotateResult? {
        val jti = runCatching { jwtProvider.extractJti(oldRefreshToken) }.getOrNull() ?: return null
        val userId = runCatching { jwtProvider.extractUserId(oldRefreshToken) }.getOrNull() ?: return null
        val record = refreshTokenRepository.findByJti(jti) ?: return null

        if (record.revoked) {
            // Reuse of revoked token — possible theft, revoke entire family
            refreshTokenRepository.revokeAllByUserId(userId)
            return null
        }
        if (record.expiresAt.isBefore(LocalDateTime.now())) return null

        refreshTokenRepository.revokeByJti(jti)
        val newRefreshJwt = issue(userId)
        val newAccessToken = jwtProvider.generate(userId)
        return RotateResult(userId, newAccessToken, newRefreshJwt)
    }

    @Transactional
    fun revokeByToken(refreshToken: String) {
        val jti = runCatching { jwtProvider.extractJti(refreshToken) }.getOrNull() ?: return
        refreshTokenRepository.revokeByJti(jti)
    }
}
