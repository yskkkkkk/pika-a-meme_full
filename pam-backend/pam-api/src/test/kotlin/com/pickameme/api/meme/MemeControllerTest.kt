package com.pickameme.api.meme

import com.fasterxml.jackson.databind.ObjectMapper
import com.pickameme.api.config.JpaConfig
import com.pickameme.application.meme.MemeCreationService
import com.pickameme.application.meme.MemeQueryService
import com.pickameme.application.meme.MemeResult
import com.pickameme.domain.exception.InsufficientHeartException
import com.pickameme.domain.exception.MemeCreationPolicyViolationException
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.Meme
import com.pickameme.domain.meme.MemeCreationOption
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import com.pickameme.infrastructure.auth.JwtProvider
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.FilterType
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.mock.web.MockPart
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDateTime
import java.util.UUID

@WebMvcTest(
    controllers = [MemeController::class],
    excludeFilters = [ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = [JpaConfig::class])]
)
class MemeControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper

    @MockBean lateinit var memeCreationService: MemeCreationService
    @MockBean lateinit var memeQueryService: MemeQueryService
    @MockBean lateinit var jwtProvider: JwtProvider

    private val userId = UUID.randomUUID()
    private val auth = UsernamePasswordAuthenticationToken(
        userId, null, listOf(SimpleGrantedAuthority("ROLE_USER"))
    )

    private fun canvasState() = CanvasState(
        templateId = "template-01",
        textItems = listOf(CanvasState.TextItem("테스트", 0.0, 0.0, 32, CanvasState.DEFAULT_FONT, "#000")),
        stickerItems = emptyList()
    )

    private fun memeResult(id: UUID = UUID.randomUUID()) = MemeResult(
        id = id,
        userId = userId,
        imageUrl = "https://r2.example.com/presigned/$id",
        canvasState = canvasState(),
        creationOption = MemeCreationOption.BASIC,
        heartType = HeartType.BASIC,
        createdAt = LocalDateTime.now()
    )

    private fun savedMeme(id: UUID = UUID.randomUUID()) = Meme(
        id = id,
        userId = userId,
        imageKey = "memes/$userId/$id.webp",
        canvasState = canvasState(),
        creationOption = MemeCreationOption.BASIC,
        heartType = HeartType.BASIC,
        createdAt = LocalDateTime.now()
    )

    private fun canvasStatePart() = MockPart(
        "canvasState",
        objectMapper.writeValueAsBytes(canvasState())
    ).also { it.headers.contentType = MediaType.APPLICATION_JSON }

    @Nested
    @DisplayName("POST /api/memes")
    inner class CreateMeme {

        @Test
        @DisplayName("정상 생성 시 201 반환 및 imageUrl 포함")
        fun `정상 생성 201`() {
            val memeId = UUID.randomUUID()
            val meme = savedMeme(memeId)
            val result = memeResult(memeId)
            whenever(memeCreationService.create(any())).thenReturn(meme)
            whenever(memeQueryService.resolveResult(any())).thenReturn(result)

            mockMvc.perform(
                multipart("/api/memes")
                    .file(MockMultipartFile("image", "test.webp", "image/webp", ByteArray(10)))
                    .part(canvasStatePart())
                    .param("creationOption", "BASIC")
                    .param("heartType", "BASIC")
                    .with(authentication(auth))
                    .with(csrf())
            )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(memeId.toString()))
                .andExpect(jsonPath("$.data.imageUrl").value(result.imageUrl))
        }

        @Test
        @DisplayName("하트 부족 시 422 반환")
        fun `하트 부족 422`() {
            whenever(memeCreationService.create(any()))
                .thenThrow(InsufficientHeartException(userId, HeartType.BASIC))

            mockMvc.perform(
                multipart("/api/memes")
                    .file(MockMultipartFile("image", "test.webp", "image/webp", ByteArray(10)))
                    .part(canvasStatePart())
                    .param("creationOption", "BASIC")
                    .param("heartType", "BASIC")
                    .with(authentication(auth))
                    .with(csrf())
            )
                .andExpect(status().isUnprocessableEntity)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INSUFFICIENT_HEART"))
        }

        @Test
        @DisplayName("정책 위반 시 422 반환")
        fun `정책 위반 422`() {
            whenever(memeCreationService.create(any()))
                .thenThrow(MemeCreationPolicyViolationException("BASIC 옵션에 스티커 불가"))

            mockMvc.perform(
                multipart("/api/memes")
                    .file(MockMultipartFile("image", "test.webp", "image/webp", ByteArray(10)))
                    .part(canvasStatePart())
                    .param("creationOption", "BASIC")
                    .param("heartType", "BASIC")
                    .with(authentication(auth))
                    .with(csrf())
            )
                .andExpect(status().isUnprocessableEntity)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("MEME_POLICY_VIOLATION"))
        }
    }

    @Nested
    @DisplayName("GET /api/memes")
    inner class GetAllMemes {

        @Test
        @WithMockUser
        @DisplayName("전체 밈 목록 조회 200")
        fun `전체 밈 조회 200`() {
            val results = listOf(memeResult(), memeResult())
            whenever(memeQueryService.findAll(0, 20)).thenReturn(results)

            mockMvc.perform(get("/api/memes"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
        }
    }

    @Nested
    @DisplayName("GET /api/memes/my")
    inner class GetMyMemes {

        @Test
        @DisplayName("내 밈 목록 조회 200")
        fun `내 밈 조회 200`() {
            val results = listOf(memeResult())
            whenever(memeQueryService.findAllByUser(userId, 0, 20)).thenReturn(results)

            mockMvc.perform(
                get("/api/memes/my")
                    .with(authentication(auth))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
        }
    }
}
