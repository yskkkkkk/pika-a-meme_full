package com.pickameme.api.auth

import com.pickameme.domain.user.OAuthProvider

// OAuth2 제공자별 응답 구조 추상화
sealed class OAuth2UserInfo(protected val attributes: Map<String, Any>) {
    abstract val providerId: String
    abstract val email: String
    abstract val username: String
    abstract val provider: OAuthProvider
}

class KakaoOAuth2UserInfo(attributes: Map<String, Any>) : OAuth2UserInfo(attributes) {
    override val provider = OAuthProvider.KAKAO
    override val providerId: String = attributes["id"].toString()

    @Suppress("UNCHECKED_CAST")
    private val account = attributes["kakao_account"] as? Map<String, Any> ?: emptyMap()

    @Suppress("UNCHECKED_CAST")
    private val profile = account["profile"] as? Map<String, Any> ?: emptyMap()

    override val email: String = account["email"] as? String ?: ""
    override val username: String = profile["nickname"] as? String ?: "카카오유저"
}

class GoogleOAuth2UserInfo(attributes: Map<String, Any>) : OAuth2UserInfo(attributes) {
    override val provider = OAuthProvider.GOOGLE
    override val providerId: String = attributes["sub"] as String
    override val email: String = attributes["email"] as? String ?: ""
    override val username: String = attributes["name"] as? String ?: "구글유저"
}

object OAuth2UserInfoFactory {
    fun of(registrationId: String, attributes: Map<String, Any>): OAuth2UserInfo =
        when (registrationId.lowercase()) {
            "kakao" -> KakaoOAuth2UserInfo(attributes)
            "google" -> GoogleOAuth2UserInfo(attributes)
            else -> throw IllegalArgumentException("지원하지 않는 OAuth2 제공자입니다: $registrationId")
        }
}
