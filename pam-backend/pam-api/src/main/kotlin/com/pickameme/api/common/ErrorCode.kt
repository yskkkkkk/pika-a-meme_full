package com.pickameme.api.common

import org.springframework.http.HttpStatus

enum class ErrorCode(val status: HttpStatus, val message: String) {
    // 하트
    INSUFFICIENT_HEART(HttpStatus.UNPROCESSABLE_ENTITY, "하트가 부족합니다."),
    HEART_NOT_FOUND(HttpStatus.NOT_FOUND, "하트 정보를 찾을 수 없습니다."),

    // 밈
    MEME_NOT_FOUND(HttpStatus.NOT_FOUND, "밈을 찾을 수 없습니다."),
    MEME_POLICY_VIOLATION(HttpStatus.UNPROCESSABLE_ENTITY, "밈 생성 정책에 위반됩니다."),
    MEME_SOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "밈 소스 데이터가 없습니다. 관리자에게 문의하세요."),

    // 유저
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),

    // 인증
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다."),

    // 공통
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "요청 값이 올바르지 않습니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다."),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.")
}
