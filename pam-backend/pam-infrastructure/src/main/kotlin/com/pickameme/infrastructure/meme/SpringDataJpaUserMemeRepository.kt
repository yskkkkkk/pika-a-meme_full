package com.pickameme.infrastructure.meme

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SpringDataJpaUserMemeRepository : JpaRepository<UserMemeJpaEntity, UUID> {

    @Query(
        value = "SELECT * FROM user_memes WHERE user_id = :userId AND enabled = true ORDER BY created_at DESC",
        countQuery = "SELECT count(*) FROM user_memes WHERE user_id = :userId AND enabled = true",
        nativeQuery = true
    )
    fun findByUserIdAndEnabled(@Param("userId") userId: UUID, pageable: Pageable): List<UserMemeJpaEntity>

    @Query(
        value = "SELECT * FROM user_memes WHERE user_id = :userId ORDER BY created_at DESC",
        countQuery = "SELECT count(*) FROM user_memes WHERE user_id = :userId",
        nativeQuery = true
    )
    fun findAllByUserId(@Param("userId") userId: UUID, pageable: Pageable): List<UserMemeJpaEntity>

    @Query(
        value = "SELECT * FROM user_memes WHERE user_id = :userId AND id = :id",
        nativeQuery = true
    )
    fun findByUserIdAndId(@Param("userId") userId: UUID, @Param("id") id: UUID): UserMemeJpaEntity?

    @Modifying
    @Query(
        value = "UPDATE user_memes SET enabled = :enabled WHERE user_id = :userId AND id = :id",
        nativeQuery = true
    )
    fun updateEnabled(@Param("userId") userId: UUID, @Param("id") id: UUID, @Param("enabled") enabled: Boolean)
}
