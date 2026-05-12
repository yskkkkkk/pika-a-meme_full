package com.pickameme.api.ratelimit

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.core.ValueOperations
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import java.time.Duration
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class RateLimitFilterTest {

    private val rule = RateLimitProperties.Rule(
        name = "compose-test",
        path = "/api/memes/compose",
        method = "GET",
        capacity = 1,
        window = Duration.ofMinutes(1),
        key = RateLimitProperties.Key.IP
    )

    @Suppress("UNCHECKED_CAST")
    private val valueOperations = mock<ValueOperations<String, String>>()
    private val redisTemplate = mock<RedisTemplate<String, String>>()
    private val filter = RateLimitFilter(
        redisTemplate = redisTemplate,
        objectMapper = ObjectMapper().registerKotlinModule(),
        properties = RateLimitProperties(rules = listOf(rule))
    )

    @Test
    @DisplayName("한도 이내 요청은 통과시키고 Redis TTL을 설정한다")
    fun `allows request within limit`() {
        whenever(redisTemplate.opsForValue()).thenReturn(valueOperations)
        whenever(valueOperations.increment(any<String>())).thenReturn(1)

        val chain = CountingFilterChain()
        val response = MockHttpServletResponse()

        filter.doFilter(request(), response, chain)

        assertEquals(200, response.status)
        assertEquals(1, chain.count)
        verify(redisTemplate).expire(eq("pam:rate-limit:compose-test:ip:127.0.0.1"), eq(Duration.ofMinutes(1)))
    }

    @Test
    @DisplayName("한도 초과 요청은 429와 Retry-After로 차단한다")
    fun `blocks request above limit`() {
        whenever(redisTemplate.opsForValue()).thenReturn(valueOperations)
        whenever(valueOperations.increment(any<String>())).thenReturn(2)
        whenever(redisTemplate.getExpire(any<String>())).thenReturn(42)

        val chain = CountingFilterChain()
        val response = MockHttpServletResponse()

        filter.doFilter(request(), response, chain)

        assertEquals(429, response.status)
        assertEquals("42", response.getHeader(HttpHeaders.RETRY_AFTER))
        assertTrue(response.contentAsString.contains("RATE_LIMIT_EXCEEDED"))
        assertEquals(0, chain.count)
    }

    @Test
    @DisplayName("매칭되지 않는 경로는 Redis 조회 없이 통과한다")
    fun `skips unmatched path`() {
        val chain = CountingFilterChain()
        val response = MockHttpServletResponse()

        filter.doFilter(MockHttpServletRequest("GET", "/api/memes"), response, chain)

        assertEquals(200, response.status)
        assertEquals(1, chain.count)
        assertFalse(response.contentAsString.contains("RATE_LIMIT_EXCEEDED"))
    }

    private fun request(): MockHttpServletRequest = MockHttpServletRequest("GET", "/api/memes/compose").apply {
        remoteAddr = "127.0.0.1"
    }
}
