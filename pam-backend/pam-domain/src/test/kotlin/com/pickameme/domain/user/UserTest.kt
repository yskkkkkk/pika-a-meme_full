package com.pickameme.domain.user

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

class UserTest {

    @Test
    @DisplayName("User creation should succeed with valid inputs")
    fun testCreateUserSuccess() {
        val username = "testuser"
        val email = "test@example.com"

        val user = User.create(username, email)

        assertThat(user.id).isNotNull()
        assertThat(user.username).isEqualTo(username)
        assertThat(user.email).isEqualTo(email)
        assertThat(user.createdAt).isNotNull()
        assertThat(user.updatedAt).isNotNull()
    }

    @Test
    @DisplayName("User creation should fail with blank username")
    fun testCreateUserBlankUsername() {
        assertThatThrownBy { User.create("", "test@example.com") }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("Username must not be blank")
    }

    @Test
    @DisplayName("User creation should fail with invalid email")
    fun testCreateUserInvalidEmail() {
        assertThatThrownBy { User.create("testuser", "invalid-email") }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("Email must be valid")
    }
}
