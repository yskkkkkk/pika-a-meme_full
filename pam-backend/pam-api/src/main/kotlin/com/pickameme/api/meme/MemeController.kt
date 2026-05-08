package com.pickameme.api.meme

import com.fasterxml.jackson.databind.ObjectMapper
import com.pickameme.api.common.ApiResponse
import com.pickameme.application.meme.CreateMemeCommand
import com.pickameme.application.meme.MemeCreationService
import com.pickameme.application.meme.MemeQueryService
import com.pickameme.application.meme.MemeComposeService
import com.pickameme.application.meme.MemeComposeResult
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.MemeCreationOption
import com.pickameme.domain.meme.UserMemeRepository
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
@RequestMapping("/api/memes")
class MemeController(
    private val memeCreationService: MemeCreationService,
    private val memeQueryService: MemeQueryService,
    private val memeComposeService: MemeComposeService,
    private val userMemeRepository: UserMemeRepository,
    private val objectMapper: ObjectMapper
) {

    /**
     * POST /api/memes
     * 밈 생성 (로그인 필수)
     * Content-Type: multipart/form-data
     *   - image: 합성된 이미지 파일
     *   - canvasState: JSON 문자열
     *   - creationOption: BASIC | SPECIAL
     *   - heartType: BASIC | SPECIAL
     */
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @AuthenticationPrincipal userId: UUID,
        @RequestPart("image") image: MultipartFile,
        @RequestPart("canvasState") canvasStateJson: String,
        @RequestParam("creationOption") creationOption: MemeCreationOption,
        @RequestParam("heartType") heartType: HeartType
    ): ApiResponse<MemeResponse> {
        val canvasState = objectMapper.readValue(canvasStateJson, CanvasState::class.java)
        val command = CreateMemeCommand(
            userId = userId,
            imageData = image.bytes,
            contentType = image.contentType ?: "image/webp",
            canvasState = canvasState,
            creationOption = creationOption,
            heartType = heartType
        )
        val meme = memeCreationService.create(command)
        return ApiResponse.ok(MemeResponse.from(memeQueryService.resolveResult(meme)))
    }

    /**
     * GET /api/memes
     * 전체 밈 갤러리 조회 (공개)
     */
    @GetMapping
    fun getAll(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResponse<List<MemeResponse>> =
        ApiResponse.ok(memeQueryService.findAll(page, size).map { MemeResponse.from(it) })

    /**
     * GET /api/memes/recent-matched
     * 이미지와 문구 태그가 겹치는 최근 완성 밈 조회 (공개)
     */
    @GetMapping("/recent-matched")
    fun getRecentMatched(
        @RequestParam(defaultValue = "10") size: Int
    ): ApiResponse<List<UserMemeResponse>> =
        ApiResponse.ok(userMemeRepository.findRecentTagMatched(size).map { UserMemeResponse.from(it) })

    /**
     * GET /api/memes/my
     * 내 밈 목록 조회 (로그인 필수)
     */
    @GetMapping("/my")
    fun getMy(
        @AuthenticationPrincipal userId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResponse<List<MemeResponse>> =
        ApiResponse.ok(memeQueryService.findAllByUser(userId, page, size).map { MemeResponse.from(it) })

    /**
     * GET /api/memes/compose
     * 밈 조합 생성 (뽑기용) — 로그인 시 user_memes에 자동 저장
     */
    @GetMapping("/compose")
    fun compose(
        @AuthenticationPrincipal userId: UUID?,
        @RequestParam("heartType") heartType: HeartType,
        @RequestParam(value = "tags", required = false) tags: List<String>?
    ): ApiResponse<MemeComposeResult> {
        val result = memeComposeService.compose(heartType, tags ?: emptyList(), userId)
        return ApiResponse.ok(result)
    }

    /**
     * GET /api/memes/my-history
     * 내 밈 생성 이력 조회 (로그인 필수)
     */
    @GetMapping("/my-history")
    fun getMyHistory(
        @AuthenticationPrincipal userId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResponse<List<UserMemeResponse>> =
        ApiResponse.ok(userMemeRepository.findByUserId(userId, page, size).map { UserMemeResponse.from(it) })

    /**
     * GET /api/memes/my-history/{memeId}
     * 내 밈 생성 이력 상세 조회 (로그인 필수)
     */
    @GetMapping("/my-history/{memeId}")
    fun getMyHistoryDetail(
        @AuthenticationPrincipal userId: UUID,
        @PathVariable memeId: UUID
    ): ApiResponse<UserMemeResponse> {
        val userMeme = userMemeRepository.findByUserIdAndId(userId, memeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "밈을 찾을 수 없습니다")
        return ApiResponse.ok(UserMemeResponse.from(userMeme))
    }
}
