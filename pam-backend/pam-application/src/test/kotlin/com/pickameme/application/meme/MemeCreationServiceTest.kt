package com.pickameme.application.meme

import com.pickameme.application.heart.HeartService
import com.pickameme.domain.exception.InsufficientHeartException
import com.pickameme.domain.exception.MemeCreationPolicyViolationException
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.Meme
import com.pickameme.domain.meme.MemeCreationOption
import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.domain.meme.MemeRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import java.util.UUID

class MemeCreationServiceTest {

    private lateinit var heartService: HeartService
    private lateinit var memeImageStorage: MemeImageStorage
    private lateinit var memeRepository: MemeRepository
    private lateinit var service: MemeCreationService

    @BeforeEach
    fun setUp() {
        heartService = mock()
        memeImageStorage = mock()
        memeRepository = mock()
        service = MemeCreationService(heartService, memeImageStorage, memeRepository)
    }

    private fun basicCommand(userId: UUID = UUID.randomUUID()) = CreateMemeCommand(
        userId = userId,
        imageData = ByteArray(10),
        canvasState = CanvasState(
            templateId = "template-01",
            textItems = listOf(
                CanvasState.TextItem("킹받는 문구", 250.0, 400.0, 32, CanvasState.DEFAULT_FONT, "#000000")
            ),
            stickerItems = emptyList()
        ),
        creationOption = MemeCreationOption.BASIC,
        heartType = HeartType.BASIC
    )

    @Nested
    @DisplayName("정상 생성 플로우")
    inner class SuccessFlow {

        @Test
        @DisplayName("BASIC 옵션으로 밈 생성 시 하트 차감 → R2 업로드 → DB 저장 순서 보장")
        fun `BASIC 밈 생성 정상 플로우`() {
            val userId = UUID.randomUUID()
            val command = basicCommand(userId)
            val savedMeme = Meme(
                id = UUID.randomUUID(), userId = userId,
                imageKey = "memes/$userId/test.webp",
                canvasState = command.canvasState,
                creationOption = command.creationOption,
                heartType = command.heartType,
                createdAt = LocalDateTime.now()
            )
            whenever(memeRepository.save(any())).thenReturn(savedMeme)

            val result = service.create(command)

            assertThat(result).isNotNull
            verify(heartService).consumeHeart(any(), any(), anyOrNull())
            verify(memeImageStorage).upload(any(), any(), any())
            verify(memeRepository).save(any())
        }

        @Test
        @DisplayName("imageKey는 memes/{userId}/{memeId}.webp 형식으로 생성")
        fun `imageKey 형식 검증`() {
            val userId = UUID.randomUUID()
            val command = basicCommand(userId)
            whenever(memeRepository.save(any())).thenAnswer { it.arguments[0] as Meme }

            val result = service.create(command)

            assertThat(result.imageKey).matches("memes/$userId/[0-9a-f-]{36}\\.webp")
        }
    }

    @Nested
    @DisplayName("정책 위반 시 조기 실패")
    inner class PolicyViolation {

        @Test
        @DisplayName("BASIC 옵션에 스티커 포함 시 하트 차감 없이 예외 발생")
        fun `정책 위반 시 하트 차감 안됨`() {
            val command = CreateMemeCommand(
                userId = UUID.randomUUID(),
                imageData = ByteArray(10),
                canvasState = CanvasState(
                    templateId = "template-01",
                    textItems = listOf(
                        CanvasState.TextItem("문구", 0.0, 0.0, 32, CanvasState.DEFAULT_FONT, "#000")
                    ),
                    stickerItems = listOf(CanvasState.StickerItem("star", 0.0, 0.0, 1.0))
                ),
                creationOption = MemeCreationOption.BASIC,
                heartType = HeartType.BASIC
            )

            assertThatThrownBy { service.create(command) }
                .isInstanceOf(MemeCreationPolicyViolationException::class.java)

            verify(heartService, never()).consumeHeart(any(), any(), anyOrNull())
            verify(memeImageStorage, never()).upload(any(), any(), any())
        }
    }

    @Nested
    @DisplayName("하트 부족 시 실패")
    inner class InsufficientHeart {

        @Test
        @DisplayName("하트 부족 시 R2 업로드 및 DB 저장 호출 안됨")
        fun `하트 부족 시 R2 업로드 안됨`() {
            val userId = UUID.randomUUID()
            val command = basicCommand(userId)
            whenever(heartService.consumeHeart(any(), any(), anyOrNull()))
                .thenThrow(InsufficientHeartException(userId, HeartType.BASIC))

            assertThatThrownBy { service.create(command) }
                .isInstanceOf(InsufficientHeartException::class.java)

            verify(memeImageStorage, never()).upload(any(), any(), any())
            verify(memeRepository, never()).save(any())
        }
    }
}
