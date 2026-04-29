package com.pickameme.infrastructure.user

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SpringDataJpaUserRepository : JpaRepository<UserJpaEntity, UUID> {
    fun findByEmail(email: String): UserJpaEntity?
}
