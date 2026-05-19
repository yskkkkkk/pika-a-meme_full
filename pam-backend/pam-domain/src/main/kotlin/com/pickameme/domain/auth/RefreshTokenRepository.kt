package com.pickameme.domain.auth

import java.util.UUID

interface RefreshTokenRepository {
    fun save(token: RefreshToken): RefreshToken
    fun findByJti(jti: UUID): RefreshToken?
    fun revokeByJti(jti: UUID)
    fun revokeAllByUserId(userId: UUID)
}
