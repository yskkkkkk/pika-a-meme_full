package com.pickameme.api.meme

import com.pickameme.api.common.ApiResponse
import com.pickameme.application.meme.MemeQueryService
import com.pickameme.application.meme.MemeComposeService
import com.pickameme.application.meme.MemeComposeResult
import com.pickameme.application.meme.SaveCompositionService
import com.pickameme.application.meme.SaveCompositionCommand
import com.pickameme.application.meme.UploadOgImageService
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.UserMemeRepository
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/memes")
class MemeController(
    private val memeQueryService: MemeQueryService,
    private val memeComposeService: MemeComposeService,
    private val saveCompositionService: SaveCompositionService,
    private val uploadOgImageService: UploadOgImageService,
    private val userMemeRepository: UserMemeRepository
) {

    companion object {
        private val SUPPORTED_LANGUAGES = setOf("ko", "en")
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
        @RequestParam(value = "tags", required = false) tags: List<String>?,
        @RequestParam(value = "lang", required = false, defaultValue = "ko") lang: String
    ): ApiResponse<MemeComposeResult> {
        if (heartType == HeartType.SPECIAL && userId == null) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required for special gacha.")
        }
        val language = if (lang in SUPPORTED_LANGUAGES) lang else "ko"
        val result = memeComposeService.compose(heartType, tags ?: emptyList(), userId, language)
        return ApiResponse.ok(result)
    }

    /**
     * GET /api/memes/recent-matched
     * 이미지와 문구 태그가 매칭된 최근 완성 밈 조회 (공개)
     */
    @GetMapping("/recent-matched")
    fun getRecentMatched(
        @RequestParam(defaultValue = "10") size: Int
    ): ApiResponse<List<UserMemeResponse>> =
        ApiResponse.ok(userMemeRepository.findRecentTagMatched(size).map { UserMemeResponse.from(it) })

    /**
     * GET /api/memes/my-history
     * 내 밈 생성 이력 조회 (로그인 필수)
     * includeHidden=true 이면 숨김 처리된 밈도 포함
     */
    @GetMapping("/my-history")
    fun getMyHistory(
        @AuthenticationPrincipal userId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "false") includeHidden: Boolean
    ): ApiResponse<List<UserMemeResponse>> {
        val memes = if (includeHidden)
            userMemeRepository.findAllByUserId(userId, page, size)
        else
            userMemeRepository.findByUserId(userId, page, size)
        return ApiResponse.ok(memes.map { UserMemeResponse.from(it) })
    }

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
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Meme not found.")
        return ApiResponse.ok(UserMemeResponse.from(userMeme))
    }

    /**
     * PATCH /api/memes/my-history/{memeId}/visibility
     * 내 밈 갤러리 노출 여부 변경 (로그인 필수)
     */
    @PatchMapping("/my-history/{memeId}/visibility")
    fun updateVisibility(
        @AuthenticationPrincipal userId: UUID,
        @PathVariable memeId: UUID,
        @RequestBody body: UpdateVisibilityRequest
    ): ApiResponse<Unit> {
        userMemeRepository.findByUserIdAndId(userId, memeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Meme not found.")
        userMemeRepository.updateEnabled(userId, memeId, body.enabled)
        return ApiResponse.ok()
    }

    /**
     * POST /api/memes/save-composition
     * 비로그인 뽑기 결과를 로그인 후 저장 (하트 차감 없음)
     */
    @PostMapping("/save-composition")
    fun saveComposition(
        @AuthenticationPrincipal userId: UUID,
        @Valid @RequestBody body: SaveCompositionRequest
    ): ApiResponse<SaveCompositionResponse> {
        val memeId = saveCompositionService.save(
            SaveCompositionCommand(
                userId = userId,
                imageId = body.imageId,
                phraseId = body.phraseId,
                heartType = body.heartType,
                imageUrl = body.imageUrl,
                subjectPosition = body.subjectPosition,
                phrase = body.phrase,
                selectedTag = body.selectedTag,
            )
        )
        return ApiResponse.ok(SaveCompositionResponse(memeId))
    }

    /**
     * POST /api/memes/{memeId}/og-image
     * 밈 공유용 OG 이미지 업로드 (로그인 필수)
     */
    @PostMapping("/{memeId}/og-image", consumes = ["multipart/form-data"])
    fun uploadOgImage(
        @AuthenticationPrincipal userId: UUID,
        @PathVariable memeId: UUID,
        @RequestParam("file") file: MultipartFile
    ): ApiResponse<Map<String, String>> {
        val userMeme = userMemeRepository.findByUserIdAndId(userId, memeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Meme not found or access denied.")
            
        val url = uploadOgImageService.upload(
            memeId = memeId,
            bytes = file.bytes,
            // Content-Type 헤더 누락 시 임의로 형식을 단정하지 않고, 미지원 형식으로 처리해 명확히 거부한다
            contentType = file.contentType ?: "application/octet-stream"
        )
        return ApiResponse.ok(mapOf("ogImageUrl" to url))
    }

    /**
     * GET /api/memes/share/{memeId}
     * 공유용 밈 조회 (공개 접근)
     */
    @GetMapping("/share/{memeId}")
    fun getSharedMeme(
        @PathVariable memeId: UUID
    ): ApiResponse<UserMemeResponse> {
        val userMeme = userMemeRepository.findById(memeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Meme not found.")
        if (!userMeme.enabled) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "This meme is deleted or private.")
        }
        return ApiResponse.ok(UserMemeResponse.from(userMeme))
    }
}

data class UpdateVisibilityRequest(val enabled: Boolean)
