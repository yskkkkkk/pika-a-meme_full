package com.pickameme.application.meme

import com.pickameme.application.heart.HeartService
import com.pickameme.domain.meme.Meme
import com.pickameme.domain.meme.MemeCreationPolicy
import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.domain.meme.MemeRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class MemeCreationService(
    private val heartService: HeartService,
    private val memeImageStorage: MemeImageStorage,
    private val memeRepository: MemeRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun create(command: CreateMemeCommand): Meme {
        log.info("밈 생성 시작: userId={}, option={}, heartType={}",
            command.userId, command.creationOption, command.heartType)

        MemeCreationPolicy.validate(command.canvasState, command.creationOption)

        val memeId = UUID.randomUUID()
        val imageKey = "memes/${command.userId}/$memeId.webp"

        heartService.consumeHeart(command.userId, command.heartType, memeId)

        memeImageStorage.upload(imageKey, command.imageData, command.contentType)
        log.debug("R2 업로드 완료: key={}", imageKey)

        val meme = Meme(
            id = memeId,
            userId = command.userId,
            imageKey = imageKey,
            canvasState = command.canvasState,
            creationOption = command.creationOption,
            heartType = command.heartType,
            createdAt = LocalDateTime.now()
        )
        val saved = memeRepository.save(meme)
        log.info("밈 생성 완료: memeId={}, userId={}", memeId, command.userId)
        return saved
    }
}
