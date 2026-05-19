package com.pickameme.infrastructure.auth

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface SpringDataJpaRefreshTokenRepository : JpaRepository<RefreshTokenJpaEntity, UUID> {

    @Modifying
    @Transactional
    @Query("UPDATE RefreshTokenJpaEntity r SET r.revoked = true WHERE r.jti = :jti")
    fun revokeByJti(jti: UUID)

    @Modifying
    @Transactional
    @Query("UPDATE RefreshTokenJpaEntity r SET r.revoked = true WHERE r.userId = :userId")
    fun revokeAllByUserId(userId: UUID)
}
