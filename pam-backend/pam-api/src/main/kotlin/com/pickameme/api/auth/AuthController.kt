package com.pickameme.api.auth

import com.pickameme.api.common.ApiResponse
import com.pickameme.domain.user.UserRepository
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
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
    @Value("\${cookie.secure:true}") private val cookieSecure: Boolean,
    @Value("\${oauth2.redirect-uri:http://localhost:3000/oauth2/callback}") private val oauth2RedirectUri: String
) {

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal userId: UUID?): ApiResponse<MeResponse?> {
        if (userId == null) return ApiResponse.ok(null)
        val user = userRepository.findById(userId) ?: return ApiResponse.ok(null)
        return ApiResponse.ok(MeResponse(id = user.id, username = user.username, email = user.email))
    }

    @GetMapping("/logout")
    fun logout(response: HttpServletResponse) {
        val expiredCookie = ResponseCookie.from("pam_token", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build()
        response.addHeader("Set-Cookie", expiredCookie.toString())
        val frontendBase = try {
            val uri = java.net.URI.create(oauth2RedirectUri)
            "${uri.scheme}://${uri.host}${if (uri.port != -1) ":${uri.port}" else ""}"
        } catch (e: Exception) {
            "/"
        }
        response.sendRedirect(frontendBase)
    }
}

data class MeResponse(val id: UUID, val username: String, val email: String)
