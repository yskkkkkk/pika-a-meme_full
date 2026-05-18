package com.pickameme.api.auth

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository
import org.springframework.stereotype.Component
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.ObjectInputStream
import java.io.ObjectOutputStream
import java.util.Base64

@Component
class CookieOAuth2AuthorizationRequestRepository(
    @Value("\${cookie.secure:true}") private val cookieSecure: Boolean,
    @Value("\${cookie.domain:}") private val cookieDomain: String,
) : AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    companion object {
        private const val COOKIE_NAME = "oauth2_auth_request"
        private const val EXPIRE_SECONDS = 180
    }

    override fun loadAuthorizationRequest(request: HttpServletRequest): OAuth2AuthorizationRequest? =
        getCookieValue(request, COOKIE_NAME)?.let { deserialize(it) }

    override fun saveAuthorizationRequest(
        authorizationRequest: OAuth2AuthorizationRequest?,
        request: HttpServletRequest,
        response: HttpServletResponse
    ) {
        if (authorizationRequest == null) {
            clearCookie(response)
            return
        }
        val builder = ResponseCookie.from(COOKIE_NAME, serialize(authorizationRequest))
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path("/")
            .maxAge(EXPIRE_SECONDS.toLong())

        val cookie = if (cookieDomain.isNotBlank()) builder.domain(cookieDomain).build() else builder.build()
        response.addHeader("Set-Cookie", cookie.toString())
    }

    override fun removeAuthorizationRequest(
        request: HttpServletRequest,
        response: HttpServletResponse
    ): OAuth2AuthorizationRequest? = loadAuthorizationRequest(request).also { clearCookie(response) }

    private fun clearCookie(response: HttpServletResponse) {
        val builder = ResponseCookie.from(COOKIE_NAME, "")
            .path("/")
            .maxAge(0)
            .secure(cookieSecure)
            .sameSite("Lax")

        val cookie = if (cookieDomain.isNotBlank()) builder.domain(cookieDomain).build() else builder.build()
        response.addHeader("Set-Cookie", cookie.toString())
    }

    private fun getCookieValue(request: HttpServletRequest, name: String): String? =
        request.cookies?.find { it.name == name }?.value

    private fun serialize(obj: OAuth2AuthorizationRequest): String {
        val baos = ByteArrayOutputStream()
        ObjectOutputStream(baos).use { it.writeObject(obj) }
        return Base64.getUrlEncoder().encodeToString(baos.toByteArray())
    }

    private fun deserialize(value: String): OAuth2AuthorizationRequest? = try {
        val bytes = Base64.getUrlDecoder().decode(value)
        ObjectInputStream(ByteArrayInputStream(bytes)).use { it.readObject() as OAuth2AuthorizationRequest }
    } catch (e: Exception) {
        null
    }
}
