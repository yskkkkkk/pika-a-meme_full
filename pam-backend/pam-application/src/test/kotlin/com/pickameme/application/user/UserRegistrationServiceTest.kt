package com.pickameme.application.user

import com.pickameme.domain.user.User
import com.pickameme.domain.user.UserRegisteredEvent
import com.pickameme.domain.user.UserRepository
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.context.ApplicationEventPublisher
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class UserRegistrationServiceTest {

    private lateinit val userRepository: UserRepository
    private lateinit val eventPublisher: ApplicationEventPublisher
    private lateinit val userRegistrationService: UserRegistrationService

    @BeforeEach
    fun setUp() {
        userRepository = mock()
        eventPublisher = mock()
        userRegistrationService = UserRegistrationService(userRepository, eventPublisher)
    }

    @Test
    @DisplayName("Should successfully register user and publish event")
    fun testRegisterUserSuccess() {
        val email = "test@example.com"
        val username = "testuser"
        val dummyUser = User.create(username, email)

        whenever(userRepository.findByEmail(email)).thenReturn(null)
        whenever(userRepository.save(any())).thenReturn(dummyUser)

        val result = userRegistrationService.registerUser(username, email)

        assertNotNull(result)
        assertEquals(username, result.username)
        verify(userRepository).save(any())
        verify(eventPublisher).publishEvent(any<UserRegisteredEvent>())
    }

    @Test
    @DisplayName("Should throw exception if email already registered")
    fun testRegisterUserEmailExists() {
        val email = "test@example.com"
        val username = "testuser"
        val dummyUser = User.create(username, email)

        whenever(userRepository.findByEmail(email)).thenReturn(dummyUser)

        assertThatThrownBy { userRegistrationService.registerUser(username, email) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("Email already registered")
    }
}
