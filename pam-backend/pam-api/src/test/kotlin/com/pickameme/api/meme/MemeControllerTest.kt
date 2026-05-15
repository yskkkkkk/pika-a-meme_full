package com.pickameme.api.meme

import com.fasterxml.jackson.databind.ObjectMapper
import com.pickameme.api.config.JpaConfig
import com.pickameme.application.meme.MemeQueryService
import com.pickameme.application.meme.MemeResult
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.MemeCreationOption
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.kotlin.whenever
import com.pickameme.infrastructure.auth.JwtProvider
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.FilterType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
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

    @MockBean lateinit var memeQueryService: MemeQueryService
    @MockBean lateinit var memeComposeService: com.pickameme.application.meme.MemeComposeService
    @MockBean lateinit var userMemeRepository: com.pickameme.domain.meme.UserMemeRepository
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
