package com.pickameme.application.auth

import com.pickameme.domain.user.OAuthProvider
import com.pickameme.domain.user.User
import com.pickameme.domain.user.UserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.pickameme.domain.user.UserRegisteredEvent

@Service
class OAuthLoginService(
    private val userRepository: UserRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    // 소셜 로그인 시 유저 조회 또는 신규 가입 처리
    @Transactional
    fun findOrRegister(
        provider: OAuthProvider,
        providerId: String,
        email: String,
        username: String
    ): User {
        return userRepository.findByProviderAndProviderId(provider, providerId)
            ?: registerNewUser(provider, providerId, email, username)
    }

    private fun registerNewUser(
        provider: OAuthProvider,
        providerId: String,
        email: String,
        username: String
    ): User {
        val user = User.createByOAuth2(username, email, provider, providerId)
        val saved = userRepository.save(user)
        eventPublisher.publishEvent(UserRegisteredEvent(saved.id, saved.email))
        return saved
    }
}
