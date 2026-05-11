package com.pickameme.api.common

enum class ErrorCode(val message: String) {
    // 하트
    INSUFFICIENT_HEART("하트가 부족합니다."),
    HEART_NOT_FOUND("하트 정보를 찾을 수 없습니다."),

    // 밈
    MEME_NOT_FOUND("밈을 찾을 수 없습니다."),
    MEME_POLICY_VIOLATION("밈 생성 정책에 위반됩니다."),
    MEME_SOURCE_NOT_FOUND("밈 소스 데이터가 없습니다. 관리자에게 문의하세요."),

    // 유저
    USER_NOT_FOUND("유저를 찾을 수 없습니다."),
    DUPLICATE_EMAIL("이미 사용 중인 이메일입니다."),

    // 공통
    INVALID_REQUEST("요청 값이 올바르지 않습니다."),
    RATE_LIMIT_EXCEEDED("요청이 너무 많습니다. 잠시 후 다시 시도해주세요."),
    INTERNAL_SERVER_ERROR("서버 오류가 발생했습니다.")
}
