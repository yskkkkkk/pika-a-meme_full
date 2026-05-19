package com.pickameme.api.common

import com.pickameme.domain.exception.DomainException
import com.pickameme.domain.exception.DuplicateEmailException
import com.pickameme.domain.exception.HeartNotFoundException
import com.pickameme.domain.exception.InsufficientHeartException
import com.pickameme.domain.exception.MemeCreationPolicyViolationException
import com.pickameme.domain.exception.MemeSourceNotFoundException
import com.pickameme.domain.exception.UserNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.resource.NoResourceFoundException

@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    // 422 — 하트 부족
    @ExceptionHandler(InsufficientHeartException::class)
    fun handleInsufficientHeart(e: InsufficientHeartException): ResponseEntity<ApiResponse<Nothing>> =
        ResponseEntity.status(ErrorCode.INSUFFICIENT_HEART.status).body(ApiResponse.fail(ErrorCode.INSUFFICIENT_HEART))

    // 422 — 밈 생성 정책 위반
    @ExceptionHandler(MemeCreationPolicyViolationException::class)
    fun handleMemePolicyViolation(e: MemeCreationPolicyViolationException): ResponseEntity<ApiResponse<Nothing>> =
        ResponseEntity.status(ErrorCode.MEME_POLICY_VIOLATION.status).body(ApiResponse.fail(ErrorCode.MEME_POLICY_VIOLATION))

    // 404 — 하트 없음
    @ExceptionHandler(HeartNotFoundException::class)
    fun handleHeartNotFound(e: HeartNotFoundException): ResponseEntity<ApiResponse<Nothing>> =
        ResponseEntity.status(ErrorCode.HEART_NOT_FOUND.status).body(ApiResponse.fail(ErrorCode.HEART_NOT_FOUND))

    // 404 — 밈 소스 없음 (meme_images/meme_phrases 데이터 공백)
    @ExceptionHandler(MemeSourceNotFoundException::class)
    fun handleMemeSourceNotFound(e: MemeSourceNotFoundException): ResponseEntity<ApiResponse<Nothing>> =
        ResponseEntity.status(ErrorCode.MEME_SOURCE_NOT_FOUND.status).body(ApiResponse.fail(ErrorCode.MEME_SOURCE_NOT_FOUND))

    // 404 — 유저 없음
    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFound(e: UserNotFoundException): ResponseEntity<ApiResponse<Nothing>> =
        ResponseEntity.status(ErrorCode.USER_NOT_FOUND.status).body(ApiResponse.fail(ErrorCode.USER_NOT_FOUND))

    // 409 — 이메일 중복
    @ExceptionHandler(DuplicateEmailException::class)
    fun handleDuplicateEmail(e: DuplicateEmailException): ResponseEntity<ApiResponse<Nothing>> =
        ResponseEntity.status(ErrorCode.DUPLICATE_EMAIL.status).body(ApiResponse.fail(ErrorCode.DUPLICATE_EMAIL))

    // 400 — Bean Validation 실패
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException): ApiResponse<Nothing> {
        val message = e.bindingResult.fieldErrors
            .joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
        log.warn("Validation failed: {}", message)
        return ApiResponse(
            success = false,
            error = ErrorDetail(ErrorCode.INVALID_REQUEST.name, message)
        )
    }

    // 400 — 그 외 DomainException (명시적으로 매핑되지 않은 비즈니스 예외)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(DomainException::class)
    fun handleDomain(e: DomainException): ApiResponse<Nothing> {
        log.warn("Domain exception: {}", e.message)
        return ApiResponse(
            success = false,
            error = ErrorDetail(ErrorCode.INVALID_REQUEST.name, e.message ?: ErrorCode.INVALID_REQUEST.message)
        )
    }

    // ResponseStatusException — HTTP 상태 코드를 그대로 전달
    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatus(e: ResponseStatusException): ResponseEntity<ApiResponse<Nothing>> {
        val code = if (e.statusCode.value() == 404) ErrorCode.MEME_SOURCE_NOT_FOUND.name else ErrorCode.INTERNAL_SERVER_ERROR.name
        return ResponseEntity.status(e.statusCode)
            .body(ApiResponse(success = false, error = ErrorDetail(code, e.reason ?: e.message ?: "error")))
    }

    // 404 — 정적 리소스 없음 (favicon.ico 등 브라우저 자동 요청)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoResourceFoundException::class)
    fun handleNoResource(e: NoResourceFoundException): ApiResponse<Nothing> =
        ApiResponse.fail(ErrorCode.RESOURCE_NOT_FOUND)

    // 500 — 예상치 못한 예외
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception::class)
    fun handleUnexpected(e: Exception): ApiResponse<Nothing> {
        log.error("Unexpected error", e)
        return ApiResponse.fail(ErrorCode.INTERNAL_SERVER_ERROR)
    }
}
