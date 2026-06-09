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
    @Transactional
    fun upload(memeId: UUID, bytes: ByteArray, contentType: String): String {
        // 1. Meme 검증
        userMemeRepository.findById(memeId) ?: throw IllegalArgumentException("밈을 찾을 수 없습니다: $memeId")
        
        // 2. R2에 업로드
        val url = memeImageStorage.uploadOgImage(memeId.toString(), bytes, contentType)
        
        // 3. DB 업데이트
        userMemeRepository.updateOgImageUrl(memeId, url)
        
        return url
    }
}
