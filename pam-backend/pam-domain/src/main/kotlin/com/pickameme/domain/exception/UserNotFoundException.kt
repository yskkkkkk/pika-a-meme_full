package com.pickameme.domain.exception

import java.util.UUID

class UserNotFoundException(userId: UUID) :
    DomainException("User not found. (userId=$userId)")
