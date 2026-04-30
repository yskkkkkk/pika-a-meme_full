package com.pickameme.application.user

import com.pickameme.domain.exception.DuplicateEmailException
import com.pickameme.domain.user.User
import com.pickameme.domain.user.UserRegisteredEvent
import com.pickameme.domain.user.UserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserRegistrationService(
    private val userRepository: UserRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    @Transactional
    fun registerUser(username: String, email: String): User {
        if (userRepository.findByEmail(email) != null) throw DuplicateEmailException(email)
        
        val user = User.create(username, email)
        val savedUser = userRepository.save(user)
        
        eventPublisher.publishEvent(UserRegisteredEvent(savedUser.id, savedUser.email))
        
        return savedUser
    }
}
