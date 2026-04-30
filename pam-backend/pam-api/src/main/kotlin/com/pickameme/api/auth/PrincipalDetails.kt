package com.pickameme.api.auth

import com.pickameme.domain.user.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.user.OAuth2User

class PrincipalDetails(
    val user: User,
    private val attributes: Map<String, Any>
) : OAuth2User {
    override fun getAttributes(): Map<String, Any> = attributes
    override fun getName(): String = user.id.toString()
    override fun getAuthorities(): Collection<GrantedAuthority> =
        listOf(SimpleGrantedAuthority("ROLE_USER"))
}
