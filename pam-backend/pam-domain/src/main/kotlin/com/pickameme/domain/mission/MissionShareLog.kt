package com.pickameme.domain.mission

import java.time.LocalDateTime
import java.util.UUID

data class MissionShareLog(
    val id: UUID,
    val userId: UUID,
    val shareType: ShareType,
    val sharedAt: LocalDateTime
) {
    enum class ShareType { INSTAGRAM, KAKAO, OTHER }
}
