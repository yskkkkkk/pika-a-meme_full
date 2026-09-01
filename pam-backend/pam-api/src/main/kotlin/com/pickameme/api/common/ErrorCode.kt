package com.pickameme.api.common

import org.springframework.http.HttpStatus

// message는 로그/디버그 전용이며 프론트에 노출되지 않는다. 사용자 노출 텍스트는 프론트 t.errors.*가 담당한다.
// code(enum name)는 프론트 분기 계약이므로 절대 변경하지 않는다.
enum class ErrorCode(val status: HttpStatus, val message: String) {
    // 하트
    INSUFFICIENT_HEART(HttpStatus.UNPROCESSABLE_ENTITY, "Insufficient heart balance."),
    HEART_NOT_FOUND(HttpStatus.NOT_FOUND, "Heart data not found."),

    // 밈
    MEME_NOT_FOUND(HttpStatus.NOT_FOUND, "Meme not found."),
    MEME_POLICY_VIOLATION(HttpStatus.UNPROCESSABLE_ENTITY, "Meme creation policy violated."),
    MEME_SOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "No meme source data available. Contact the administrator."),

    // 유저
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "Email already in use."),

    // 인증
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid refresh token."),

    // 공통
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Requested resource not found."),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Please try again later."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error.")
}
