package com.pickameme.api.heart

import com.pickameme.api.config.JpaConfig
import com.pickameme.application.heart.HeartService
import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartType
import com.pickameme.infrastructure.auth.JwtProvider
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.FilterType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDateTime
import java.util.UUID

@WebMvcTest(
    controllers = [HeartController::class],
    excludeFilters = [ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = [JpaConfig::class])]
)
class HeartControllerTest {

    @Autowired lateinit var mockMvc: MockMvc

    @MockBean lateinit var heartService: HeartService
    @MockBean lateinit var jwtProvider: JwtProvider

    private val userId = UUID.randomUUID()
    private val auth = UsernamePasswordAuthenticationToken(
        userId, null, listOf(SimpleGrantedAuthority("ROLE_USER"))
    )

    @Nested
    @DisplayName("GET /api/hearts")
    inner class GetHearts {

        @Test
        @DisplayName("BASIC 만료 전 (만충): nextChargeAt null")
        fun `하트 만충 시 nextChargeAt null`() {
            val basicHeart = Heart(
                id = UUID.randomUUID(), userId = userId, type = HeartType.BASIC,
                count = 5, lastChargedAt = LocalDateTime.now()
            )
            whenever(heartService.getHearts(userId)).thenReturn(listOf(basicHeart))

            mockMvc.perform(get("/api/hearts").with(authentication(auth)))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.basic.count").value(5))
                .andExpect(jsonPath("$.data.basic.max").value(5))
                .andExpect(jsonPath("$.data.basic.nextChargeAt").doesNotExist())
                .andExpect(jsonPath("$.data.special.count").value(0))
        }

        @Test
        @DisplayName("BASIC 부족 시: nextChargeAt 계산 포함")
        fun `하트 부족 시 nextChargeAt 포함`() {
            val lastCharged = LocalDateTime.of(2026, 5, 1, 10, 0, 0)
            val basicHeart = Heart(
                id = UUID.randomUUID(), userId = userId, type = HeartType.BASIC,
                count = 2, lastChargedAt = lastCharged
            )
            whenever(heartService.getHearts(userId)).thenReturn(listOf(basicHeart))

            mockMvc.perform(get("/api/hearts").with(authentication(auth)))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.basic.count").value(2))
                .andExpect(jsonPath("$.data.basic.nextChargeAt").value("2026-05-01T10:05:00"))
        }

        @Test
        @DisplayName("BASIC + SPECIAL 모두 보유 시 정상 반환")
        fun `BASIC SPECIAL 모두 반환`() {
            val basicHeart = Heart(
                id = UUID.randomUUID(), userId = userId, type = HeartType.BASIC,
                count = 3, lastChargedAt = LocalDateTime.now()
            )
            val specialHeart = Heart(
                id = UUID.randomUUID(), userId = userId, type = HeartType.SPECIAL,
                count = 2, lastChargedAt = null
            )
            whenever(heartService.getHearts(userId)).thenReturn(listOf(basicHeart, specialHeart))

            mockMvc.perform(get("/api/hearts").with(authentication(auth)))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.basic.count").value(3))
                .andExpect(jsonPath("$.data.special.count").value(2))
                .andExpect(jsonPath("$.data.special.max").doesNotExist())
        }

        @Test
        @DisplayName("미인증 요청 시 401/302 반환")
        fun `미인증 401`() {
            mockMvc.perform(get("/api/hearts"))
                .andExpect(status().is3xxRedirection)
        }
    }
}
