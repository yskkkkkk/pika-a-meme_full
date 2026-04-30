package com.pickameme.api.common

data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: ErrorDetail? = null
) {
    companion object {
        fun <T> ok(data: T): ApiResponse<T> = ApiResponse(success = true, data = data)
        fun ok(): ApiResponse<Unit> = ApiResponse(success = true)
        fun <T> fail(code: ErrorCode): ApiResponse<T> =
            ApiResponse(success = false, error = ErrorDetail(code.name, code.message))
    }
}

data class ErrorDetail(
    val code: String,
    val message: String
)
