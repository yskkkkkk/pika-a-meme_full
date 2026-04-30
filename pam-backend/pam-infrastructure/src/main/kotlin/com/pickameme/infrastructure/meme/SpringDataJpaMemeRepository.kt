package com.pickameme.infrastructure.meme

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SpringDataJpaMemeRepository : JpaRepository<MemeJpaEntity, UUID> {
    fun findAllByUserIdOrderByCreatedAtDesc(userId: UUID, pageable: Pageable): List<MemeJpaEntity>
}
