package com.pickameme.domain.exception

import com.pickameme.domain.heart.HeartType
import java.util.UUID

class HeartNotFoundException(userId: UUID, type: HeartType) :
    DomainException("하트를 찾을 수 없습니다. (userId=$userId, type=$type)")
