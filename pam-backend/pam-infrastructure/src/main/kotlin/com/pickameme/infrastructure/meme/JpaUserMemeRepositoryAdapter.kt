package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.UserMeme
import com.pickameme.domain.meme.UserMemeRepository
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
            createdAt = userMeme.createdAt
        )
        return jpaRepository.save(entity).toDomain()
    }

    override fun findByUserId(userId: UUID, page: Int, size: Int): List<UserMeme> =
        jpaRepository.findByUserIdAndEnabledImages(userId, PageRequest.of(page, size))
            .map { it.toDomain() }

    override fun findByUserIdAndId(userId: UUID, id: UUID): UserMeme? =
        jpaRepository.findByUserIdAndIdAndEnabledImage(userId, id)?.toDomain()
}
