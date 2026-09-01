package com.pickameme.domain.exception

import com.pickameme.domain.heart.HeartType
import java.util.UUID

class InsufficientHeartException(userId: UUID, type: HeartType) :
    DomainException("Insufficient heart balance. (userId=$userId, type=$type)")
