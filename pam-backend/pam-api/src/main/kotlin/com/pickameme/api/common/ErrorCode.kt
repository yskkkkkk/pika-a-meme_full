package com.pickameme.api.common

enum class ErrorCode(val message: String) {
    // 하트
    INSUFFICIENT_HEART("하트가 부족합니다."),
    HEART_NOT_FOUND("하트 정보를 찾을 수 없습니다."),

    // 유저
    USER_NOT_FOUND("유저를 찾을 수 없습니다."),
    DUPLICATE_EMAIL("이미 사용 중인 이메일입니다."),

    // 공통
    INVALID_REQUEST("요청 값이 올바르지 않습니다."),
    INTERNAL_SERVER_ERROR("서버 오류가 발생했습니다.")
}
