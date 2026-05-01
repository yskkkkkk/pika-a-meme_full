package com.pickameme.application.meme

import com.pickameme.application.heart.HeartService
import com.pickameme.domain.meme.Meme
import com.pickameme.domain.meme.MemeCreationPolicy
import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.domain.meme.MemeRepository
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

    @Transactional
    fun create(command: CreateMemeCommand): Meme {
        // 1. 정책 검증 — 외부 리소스 건드리기 전 빠른 실패
        MemeCreationPolicy.validate(command.canvasState, command.creationOption)

        // 2. memeId 선발급 — 하트 이력과 R2 키에 동일 ID 사용
        val memeId = UUID.randomUUID()
        val imageKey = "memes/${command.userId}/$memeId.webp"

        // 3. 하트 차감 (Redisson 분산 락, lazy 충전 선수행)
        heartService.consumeHeart(command.userId, command.heartType, memeId)

        // 4. R2 이미지 업로드 — 트랜잭션 외부 작업, 실패 시 예외 전파
        memeImageStorage.upload(imageKey, command.imageData, command.contentType)

        // 5. Meme 엔티티 저장
        val meme = Meme(
            id = memeId,
            userId = command.userId,
            imageKey = imageKey,
            canvasState = command.canvasState,
            creationOption = command.creationOption,
            heartType = command.heartType,
            createdAt = LocalDateTime.now()
        )
        return memeRepository.save(meme)
    }
}
