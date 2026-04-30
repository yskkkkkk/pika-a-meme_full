package com.pickameme.domain.exception

import com.pickameme.domain.heart.HeartType
import java.util.UUID

class InsufficientHeartException(userId: UUID, type: HeartType) :
    DomainException("하트가 부족합니다. (userId=$userId, type=$type)")
