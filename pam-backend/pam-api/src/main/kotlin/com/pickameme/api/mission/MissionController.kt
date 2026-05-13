package com.pickameme.api.mission

import com.pickameme.api.common.ApiResponse
import com.pickameme.application.mission.MissionService
import com.pickameme.domain.mission.MissionShareLog
import com.pickameme.domain.mission.MissionTrigger
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/missions")
class MissionController(
    private val missionService: MissionService
) {

    @GetMapping
    fun getMissions(
        @AuthenticationPrincipal userId: UUID
    ): ApiResponse<List<MissionResponse>> {
        val missions = missionService.getMissionsForUser(userId)
        return ApiResponse.ok(missions.map { MissionResponse.from(it) })
    }

    @PostMapping("/visit")
    fun recordVisit(
        @AuthenticationPrincipal userId: UUID
    ): ApiResponse<Unit> {
        missionService.trigger(userId, MissionTrigger.Visit)
        return ApiResponse.ok()
    }

    @PostMapping("/share")
    fun recordShare(
        @AuthenticationPrincipal userId: UUID,
        @RequestBody body: ShareRequest
    ): ApiResponse<Unit> {
        missionService.trigger(userId, MissionTrigger.Share(body.shareType))
        return ApiResponse.ok()
    }
}

data class ShareRequest(val shareType: MissionShareLog.ShareType)
