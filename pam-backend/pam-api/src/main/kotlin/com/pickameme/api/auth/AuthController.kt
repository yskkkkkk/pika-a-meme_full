package com.pickameme.api.auth

import com.pickameme.api.common.ApiResponse
import com.pickameme.api.common.ErrorCode
import com.pickameme.domain.user.OAuthProvider
import com.pickameme.domain.user.UserRepository
import com.pickameme.infrastructure.auth.JwtProvider
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val userRepository: UserRepository,
    private val jwtProvider: JwtProvider,
    private val refreshTokenService: RefreshTokenService,
    @Value("\${cookie.secure:true}") private val cookieSecure: Boolean,
    @Value("\${cookie.domain:}") private val cookieDomain: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long,
    @Value("\${oauth2.redirect-uri:http://localhost:3000/oauth2/callback}") private val oauth2RedirectUri: String
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal userId: UUID?): ApiResponse<MeResponse?> {
        if (userId == null) return ApiResponse.ok(null)
        val user = userRepository.findById(userId) ?: return ApiResponse.ok(null)
        return ApiResponse.ok(MeResponse(id = user.id, username = user.username, email = user.email, provider = user.provider))
    }

    @PostMapping("/refresh")
    fun refresh(request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<ApiResponse<Unit>> {
        val refreshToken = request.cookies
            ?.firstOrNull { it.name == "pam_refresh" }
            ?.value
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.fail(ErrorCode.INVALID_REFRESH_TOKEN))

        val result = refreshTokenService.rotate(refreshToken)
            ?: run {
                clearRefreshCookie(response)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail(ErrorCode.INVALID_REFRESH_TOKEN))
            }

        response.addHeader("Set-Cookie", buildCookie("pam_token", result.newAccessToken, "/", expirationMs / 1000).toString())
        response.addHeader("Set-Cookie", buildCookie("pam_refresh", result.newRefreshJwt, "/api/auth", refreshExpirationMs / 1000).toString())
        return ResponseEntity.ok(ApiResponse.ok())
    }

    @GetMapping("/logout")
    fun logout(request: HttpServletRequest, response: HttpServletResponse) {
        request.cookies?.firstOrNull { it.name == "pam_refresh" }?.value?.let {
            refreshTokenService.revokeByToken(it)
        }

        clearTokenCookie(response)
        clearRefreshCookie(response)

        val frontendBase = try {
            val uri = java.net.URI.create(oauth2RedirectUri)
            "${uri.scheme}://${uri.host}${if (uri.port != -1) ":${uri.port}" else ""}"
        } catch (e: Exception) {
            log.error("Failed to parse OAuth2 Redirect URI: {}", oauth2RedirectUri, e)
            "/"
        }
        response.sendRedirect(frontendBase)
    }

    private fun buildCookie(name: String, value: String, path: String, maxAgeSec: Long): ResponseCookie {
        val builder = ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path(path)
            .maxAge(maxAgeSec)
        return if (cookieDomain.isNotBlank()) builder.domain(cookieDomain).build() else builder.build()
    }

    private fun clearTokenCookie(response: HttpServletResponse) {
        val base = ResponseCookie.from("pam_token", "")
            .httpOnly(true).secure(cookieSecure).sameSite("Lax").path("/").maxAge(0)
        response.addHeader("Set-Cookie", base.build().toString())
        if (cookieDomain.isNotBlank()) {
            response.addHeader("Set-Cookie", base.domain(cookieDomain).build().toString())
        }
    }

    private fun clearRefreshCookie(response: HttpServletResponse) {
        val base = ResponseCookie.from("pam_refresh", "")
            .httpOnly(true).secure(cookieSecure).sameSite("Lax").path("/api/auth").maxAge(0)
        response.addHeader("Set-Cookie", base.build().toString())
        if (cookieDomain.isNotBlank()) {
            response.addHeader("Set-Cookie", base.domain(cookieDomain).build().toString())
        }
    }
}

data class MeResponse(val id: UUID, val username: String, val email: String, val provider: OAuthProvider)
