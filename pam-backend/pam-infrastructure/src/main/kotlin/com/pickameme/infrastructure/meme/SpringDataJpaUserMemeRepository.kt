package com.pickameme.infrastructure.meme

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SpringDataJpaUserMemeRepository : JpaRepository<UserMemeJpaEntity, UUID> {
    fun findByUserIdOrderByCreatedAtDesc(userId: UUID, pageable: Pageable): List<UserMemeJpaEntity>
    fun findByUserIdAndId(userId: UUID, id: UUID): UserMemeJpaEntity?
}
