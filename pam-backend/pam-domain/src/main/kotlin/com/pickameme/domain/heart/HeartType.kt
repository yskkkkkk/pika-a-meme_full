package com.pickameme.domain.heart

enum class HeartType {
    BASIC,   // 시간 기반 자동 충전, Redis TTL Lazy Update
    SPECIAL  // 조건/이벤트 기반 지급, 시간 제한 없음
}
