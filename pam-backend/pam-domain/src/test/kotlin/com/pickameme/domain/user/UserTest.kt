// OCI 배포 워크플로우 트리거용 변경
package com.pickameme.domain.user

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

class UserTest {

    @Test
    @DisplayName("유효한 입력으로 User 생성 성공")
    fun `create user with valid inputs`() {
        val user = User.createByOAuth2(
            username = "testuser",
            email = "test@example.com",
            provider = OAuthProvider.GOOGLE,
            providerId = "google-123"
        )

        assertThat(user.id).isNotNull()
        assertThat(user.username).isEqualTo("testuser")
        assertThat(user.email).isEqualTo("test@example.com")
        assertThat(user.createdAt).isNotNull()
        assertThat(user.updatedAt).isNotNull()
    }

    @Test
    @DisplayName("빈 username으로 User 생성 실패")
    fun `create user with blank username fails`() {
        assertThatThrownBy {
            User.createByOAuth2(
                username = "",
                email = "test@example.com",
                provider = OAuthProvider.GOOGLE,
                providerId = "google-123"
            )
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("Username must not be blank")
    }

    @Test
    @DisplayName("빈 email로 User 생성 실패")
    fun `create user with blank email fails`() {
        assertThatThrownBy {
            User.createByOAuth2(
                username = "testuser",
                email = "",
                provider = OAuthProvider.GOOGLE,
                providerId = "google-123"
            )
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("Email must not be blank")
    }
}
