package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.UserMeme
import com.pickameme.domain.meme.UserMemeRepository
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaUserMemeRepositoryAdapter(
    private val jpaRepository: SpringDataJpaUserMemeRepository
) : UserMemeRepository {

    override fun save(userMeme: UserMeme): UserMeme {
        val entity = UserMemeJpaEntity(
            id = userMeme.id,
            userId = userMeme.userId,
            imageId = userMeme.imageId,
            phraseId = userMeme.phraseId,
            heartType = userMeme.heartType,
            composition = userMeme.composition,
            selectedTag = userMeme.selectedTag,
            matchedTags = userMeme.matchedTags,
            createdAt = userMeme.createdAt
        )
        return jpaRepository.save(entity).toDomain()
    }

    override fun findByUserId(userId: UUID, page: Int, size: Int): List<UserMeme> =
        jpaRepository.findByUserIdAndEnabled(userId, PageRequest.of(page, size))
            .map { it.toDomain() }

    override fun findAllByUserId(userId: UUID, page: Int, size: Int): List<UserMeme> =
        jpaRepository.findAllByUserId(userId, PageRequest.of(page, size))
            .map { it.toDomain() }

    override fun findByUserIdAndId(userId: UUID, id: UUID): UserMeme? =
        jpaRepository.findByUserIdAndId(userId, id)?.toDomain()

    override fun findById(id: UUID): UserMeme? =
        jpaRepository.findById(id).orElse(null)?.toDomain()

    @Cacheable("recent-matched-memes")
    override fun findRecentTagMatched(limit: Int): List<UserMeme> =
        jpaRepository.findRecentTagMatched(limit)
            .map { it.toDomain() }

    @Transactional
    override fun updateEnabled(userId: UUID, id: UUID, enabled: Boolean) =
        jpaRepository.updateEnabled(userId, id, enabled)

    @Transactional
    override fun updateOgImageUrl(id: UUID, url: String) =
        jpaRepository.updateOgImageUrl(id, url)

    override fun countAllByUserId(userId: UUID): Long =
        jpaRepository.countAllByUserId(userId)
}
