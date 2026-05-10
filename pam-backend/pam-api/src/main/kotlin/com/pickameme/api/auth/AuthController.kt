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
    @Value("\${cookie.secure:true}") private val cookieSecure: Boolean
) {

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal userId: UUID?): ApiResponse<MeResponse?> {
        if (userId == null) return ApiResponse.ok(null)
        val user = userRepository.findById(userId) ?: return ApiResponse.ok(null)
        return ApiResponse.ok(MeResponse(id = user.id, username = user.username, email = user.email))
    }

    @PostMapping("/logout")
    fun logout(response: HttpServletResponse): ApiResponse<Unit> {
        val expiredCookie = ResponseCookie.from("pam_token", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build()
        response.addHeader("Set-Cookie", expiredCookie.toString())
        return ApiResponse.ok()
    }
}

data class MeResponse(val id: UUID, val username: String, val email: String)
