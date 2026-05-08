package com.pickameme.infrastructure.meme

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SpringDataJpaUserMemeRepository : JpaRepository<UserMemeJpaEntity, UUID> {

    @Query(
        value = """
            SELECT um.* FROM user_memes um
            JOIN meme_images mi ON um.image_id = mi.id
            WHERE um.user_id = :userId AND mi.enabled = true
            ORDER BY um.created_at DESC
        """,
        countQuery = """
            SELECT count(*) FROM user_memes um
            JOIN meme_images mi ON um.image_id = mi.id
            WHERE um.user_id = :userId AND mi.enabled = true
        """,
        nativeQuery = true
    )
    fun findByUserIdAndEnabledImages(@Param("userId") userId: UUID, pageable: Pageable): List<UserMemeJpaEntity>

    @Query(
        value = """
            SELECT um.* FROM user_memes um
            JOIN meme_images mi ON um.image_id = mi.id
            WHERE um.user_id = :userId AND um.id = :id AND mi.enabled = true
        """,
        nativeQuery = true
    )
    fun findByUserIdAndIdAndEnabledImage(@Param("userId") userId: UUID, @Param("id") id: UUID): UserMemeJpaEntity?
}
