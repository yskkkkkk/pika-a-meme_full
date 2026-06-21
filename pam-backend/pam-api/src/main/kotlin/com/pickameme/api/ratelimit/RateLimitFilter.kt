package com.pickameme.api.ratelimit

import com.fasterxml.jackson.databind.ObjectMapper
import com.pickameme.api.common.ApiResponse
import com.pickameme.api.common.ErrorCode
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.core.script.DefaultRedisScript
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Duration
import java.util.UUID

@Component
@ConditionalOnProperty(prefix = "app.rate-limit", name = ["enabled"], havingValue = "true", matchIfMissing = true)
@ConditionalOnBean(RedisTemplate::class)
class RateLimitFilter(
    private val redisTemplate: RedisTemplate<String, String>,
    private val objectMapper: ObjectMapper,
    private val properties: RateLimitProperties
) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val rule = properties.rules.firstOrNull { it.matches(request) }

        if (rule == null) {
            filterChain.doFilter(request, response)
            return
        }

        val rateLimitKey = rateLimitKey(rule, request)
        val result = runCatching { consume(rateLimitKey, rule.window) }
            .getOrElse { e ->
                log.warn("Rate limit check failed for rule={} key={}", rule.name, rateLimitKey, e)
                if (properties.failClosed) Long.MAX_VALUE else 0L
            }

        if (result > rule.capacity) {
            val retryAfter = retryAfterSeconds(rateLimitKey, rule.window)
            response.status = HttpStatus.TOO_MANY_REQUESTS.value()
            response.contentType = MediaType.APPLICATION_JSON_VALUE
            response.characterEncoding = Charsets.UTF_8.name()
            response.setHeader(HttpHeaders.RETRY_AFTER, retryAfter.toString())
            objectMapper.writeValue(response.writer, ApiResponse.fail<Nothing>(ErrorCode.RATE_LIMIT_EXCEEDED))
            return
        }

        filterChain.doFilter(request, response)
    }

    companion object {
        private const val RATE_LIMIT_SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            return current
        """
        private val script = DefaultRedisScript(RATE_LIMIT_SCRIPT, Long::class.java)
    }

    private fun consume(key: String, window: Duration): Long {
        return redisTemplate.execute(
            script,
            listOf(key),
            window.seconds.toString()
        ) as? Long ?: 1L // Redis 장애 시 fail-open: 요청 차단보다 서비스 가용성 우선
    }

    private fun retryAfterSeconds(key: String, window: Duration): Long {
        val ttl = redisTemplate.getExpire(key)
        return if (ttl > 0) ttl else window.seconds.coerceAtLeast(1)
    }

    private fun rateLimitKey(rule: RateLimitProperties.Rule, request: HttpServletRequest): String {
        val ip = clientIp(request)
        val userId = currentUserId()
        val actor = when (rule.key) {
            RateLimitProperties.Key.IP -> "ip:$ip"
            RateLimitProperties.Key.USER_OR_IP -> userId?.let { "user:$it" } ?: "ip:$ip"
            RateLimitProperties.Key.USER_AND_IP -> userId?.let { "user:$it:ip:$ip" } ?: "ip:$ip"
        }
        return "pam:rate-limit:${rule.name}:$actor"
    }

    private fun clientIp(request: HttpServletRequest): String {
        if (properties.useForwardedHeaders) {
            request.getHeader("CF-Connecting-IP")
                ?.takeIf { it.isNotBlank() }
                ?.let { return it.trim() }

            request.getHeader("X-Forwarded-For")
                ?.split(",")
                ?.firstOrNull()
                ?.trim()
                ?.takeIf { it.isNotBlank() }
                ?.let { return it }
        }
        return request.remoteAddr ?: "unknown"
    }

    private fun currentUserId(): UUID? = when (val principal = SecurityContextHolder.getContext().authentication?.principal) {
        is UUID -> principal
        is String -> runCatching { UUID.fromString(principal) }.getOrNull()
        else -> null
    }

    private fun RateLimitProperties.Rule.matches(request: HttpServletRequest): Boolean {
        val methodMatches = method == null || method.equals(request.method, ignoreCase = true)
        if (!methodMatches) return false

        val requestPath = request.requestURI
        val pathMatches = if (path.endsWith("/")) {
            requestPath.startsWith(path)
        } else {
            requestPath == path
        }
        return pathMatches
    }
}
