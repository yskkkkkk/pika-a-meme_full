package com.pickameme.domain.user

import java.util.UUID

data class UserRegisteredEvent(
    val userId: UUID,
    val email: String
)
