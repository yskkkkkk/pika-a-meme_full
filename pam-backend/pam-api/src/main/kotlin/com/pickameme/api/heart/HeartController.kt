package com.pickameme.api.heart

import com.pickameme.api.common.ApiResponse
import com.pickameme.application.heart.HeartService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/hearts")
class HeartController(
    private val heartService: HeartService
) {

    @GetMapping
    fun getHearts(
        @AuthenticationPrincipal userId: UUID?
    ): ApiResponse<HeartsResponse?> {
        if (userId == null) return ApiResponse.ok(null)
        return ApiResponse.ok(HeartsResponse.from(heartService.getHearts(userId)))
    }
}
