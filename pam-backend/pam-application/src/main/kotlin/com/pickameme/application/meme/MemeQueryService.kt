package com.pickameme.application.meme

import com.pickameme.domain.meme.Meme
import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.domain.meme.MemeRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class MemeQueryService(
    private val memeRepository: MemeRepository,
    private val memeImageStorage: MemeImageStorage
) {

    fun findAll(page: Int, size: Int): List<MemeResult> =
        memeRepository.findAll(page, size).map { it.toResult() }

    fun findAllByUser(userId: UUID, page: Int, size: Int): List<MemeResult> =
        memeRepository.findAllByUserId(userId, page, size).map { it.toResult() }

    fun resolveResult(meme: Meme): MemeResult = meme.toResult()

    private fun Meme.toResult() = MemeResult(
        id = id,
        userId = userId,
        imageUrl = memeImageStorage.generatePresignedGetUrl(imageKey),
        canvasState = canvasState,
        creationOption = creationOption,
        heartType = heartType,
        createdAt = createdAt
    )
}
