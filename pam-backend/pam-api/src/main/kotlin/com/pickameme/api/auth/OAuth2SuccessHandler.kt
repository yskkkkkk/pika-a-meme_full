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
    @Value("\${oauth2.redirect-uri}") private val redirectUri: String,
    @Value("\${cookie.secure:true}") private val cookieSecure: Boolean,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long
) : SimpleUrlAuthenticationSuccessHandler() {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val principal = authentication.principal as PrincipalDetails
        val token = jwtProvider.generate(principal.user.id)

        val cookie = ResponseCookie.from("pam_token", token)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(if (cookieSecure) "None" else "Lax")
            .path("/")
            .maxAge(expirationMs / 1000)
            .build()

        response.addHeader("Set-Cookie", cookie.toString())
        redirectStrategy.sendRedirect(request, response, redirectUri)
    }
}
