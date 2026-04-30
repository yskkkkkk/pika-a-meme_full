package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.Meme
import com.pickameme.domain.meme.MemeRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaMemeRepositoryAdapter(
    private val jpaRepository: SpringDataJpaMemeRepository
) : MemeRepository {

    override fun save(meme: Meme): Meme =
        jpaRepository.save(meme.toEntity()).toDomain()

    override fun findById(id: UUID): Meme? =
        jpaRepository.findById(id).map { it.toDomain() }.orElse(null)

    override fun findAllByUserId(userId: UUID, page: Int, size: Int): List<Meme> =
        jpaRepository.findAllByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
            .map { it.toDomain() }

    override fun findAll(page: Int, size: Int): List<Meme> =
        jpaRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
            .content.map { it.toDomain() }

    private fun Meme.toEntity() = MemeJpaEntity(
        id = id,
        userId = userId,
        imageKey = imageKey,
        canvasState = canvasState,
        creationOption = creationOption,
        heartType = heartType,
        createdAt = createdAt
    )

    private fun MemeJpaEntity.toDomain() = Meme(
        id = id,
        userId = userId,
        imageKey = imageKey,
        canvasState = canvasState,
        creationOption = creationOption,
        heartType = heartType,
        createdAt = createdAt
    )
}
