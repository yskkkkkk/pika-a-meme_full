package com.pickameme.domain.heart

enum class HeartAction {
    CONSUME, // 밈 생성 시 차감
    CHARGE,  // BASIC 자동 충전
    GRANT    // SPECIAL 조건 달성 지급
}
