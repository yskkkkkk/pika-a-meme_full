package com.pickameme.domain.exception

import java.util.UUID

class UserNotFoundException(userId: UUID) :
    DomainException("유저를 찾을 수 없습니다. (userId=$userId)")
