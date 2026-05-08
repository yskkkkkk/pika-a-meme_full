package com.pickameme.infrastructure.meme

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SpringDataJpaUserMemeRepository : JpaRepository<UserMemeJpaEntity, UUID> {
    fun findByUserIdOrderByCreatedAtDesc(userId: UUID, pageable: Pageable): List<UserMemeJpaEntity>
    fun findByUserIdAndId(userId: UUID, id: UUID): UserMemeJpaEntity?

    @Query(
        value = """
            SELECT um.* FROM user_memes um
            JOIN meme_images mi ON um.image_id = mi.id
            JOIN meme_phrases mp ON um.phrase_id = mp.id
            WHERE um.enabled = true
              AND mi.enabled = true
              AND EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(mi.tags) AS img_tag
                WHERE img_tag IN (SELECT jsonb_array_elements_text(mp.tags))
              )
            ORDER BY um.created_at DESC
            LIMIT :limit
        """,
        nativeQuery = true
    )
    fun findRecentTagMatched(@Param("limit") limit: Int): List<UserMemeJpaEntity>
}
