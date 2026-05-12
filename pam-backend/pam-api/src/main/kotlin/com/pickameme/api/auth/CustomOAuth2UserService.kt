package com.pickameme.api.auth

import com.pickameme.application.auth.OAuthLoginService
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

@Service
class CustomOAuth2UserService(
    private val oAuthLoginService: OAuthLoginService
) : DefaultOAuth2UserService() {

    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        val oAuth2User = super.loadUser(userRequest)
        val registrationId = userRequest.clientRegistration.registrationId
        val userInfo = OAuth2UserInfoFactory.of(registrationId, oAuth2User.attributes)

        val (user, isNewUser) = oAuthLoginService.findOrRegister(
            provider = userInfo.provider,
            providerId = userInfo.providerId,
            email = userInfo.email,
            username = userInfo.username
        )

        return PrincipalDetails(user, oAuth2User.attributes, isNewUser)
    }
}
