package com.pickameme.api.auth

import com.pickameme.infrastructure.auth.JwtProvider
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component

@Component
class OAuth2SuccessHandler(
    private val jwtProvider: JwtProvider,
    private val refreshTokenService: RefreshTokenService,
    @Value("\${oauth2.redirect-uri}") private val redirectUri: String,
    @Value("\${cookie.secure:true}") private val cookieSecure: Boolean,
    @Value("\${cookie.domain:}") private val cookieDomain: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long
) : SimpleUrlAuthenticationSuccessHandler() {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val principal = authentication.principal as PrincipalDetails
        val userId = principal.user.id

        val accessToken = jwtProvider.generate(userId)
        val refreshJwt = refreshTokenService.issue(userId)

        response.addHeader("Set-Cookie", buildCookie("pam_token", accessToken, "/", expirationMs / 1000).toString())
        response.addHeader("Set-Cookie", buildCookie("pam_refresh", refreshJwt, "/api/auth", refreshExpirationMs / 1000).toString())

        val target = if (principal.isNewUser) "$redirectUri?welcome=1" else redirectUri
        redirectStrategy.sendRedirect(request, response, target)
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
}
