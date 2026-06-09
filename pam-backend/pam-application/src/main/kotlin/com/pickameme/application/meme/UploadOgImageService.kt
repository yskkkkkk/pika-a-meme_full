package com.pickameme.application.meme

import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.domain.meme.UserMemeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class UploadOgImageService(
    private val memeImageStorage: MemeImageStorage,
    private val userMemeRepository: UserMemeRepository
) {
    private val allowedContentTypes = setOf("image/jpeg", "image/png")

    @Transactional
    fun upload(memeId: UUID, bytes: ByteArray, contentType: String): String {
        // 1. MIME 검증
        if (!allowedContentTypes.contains(contentType)) {
            throw IllegalArgumentException("지원하지 않는 이미지 형식입니다: $contentType")
        }
        
        // 2. R2에 업로드
        val url = memeImageStorage.uploadOgImage(memeId.toString(), bytes, contentType)
        
        // 3. DB 업데이트 (존재 여부 및 소유권은 Controller에서 이미 검증 완료)
        userMemeRepository.updateOgImageUrl(memeId, url)
        
        return url
    }
}
