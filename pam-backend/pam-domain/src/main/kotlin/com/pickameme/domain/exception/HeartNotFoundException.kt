package com.pickameme.domain.exception

import com.pickameme.domain.heart.HeartType
import java.util.UUID

class HeartNotFoundException(userId: UUID, type: HeartType) :
    DomainException("Heart not found. (userId=$userId, type=$type)")
