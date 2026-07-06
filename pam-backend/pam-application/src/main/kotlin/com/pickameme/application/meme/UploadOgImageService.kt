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
    // Content-Type별 파일 시그니처 (매직 바이트) — 헤더는 위조 가능하므로 실제 바이트 검증
    private val magicBytes = mapOf(
        "image/jpeg" to byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte()),
        "image/png" to byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
    )

    @Transactional
    fun upload(memeId: UUID, bytes: ByteArray, contentType: String): String {
        // 1. MIME 검증
        val signature = magicBytes[contentType]
            ?: throw IllegalArgumentException("지원하지 않는 이미지 형식입니다: $contentType")

        // 2. 매직 바이트 검증 — 선언된 형식과 실제 파일 헤더 일치 확인
        if (bytes.size < signature.size ||
            !bytes.copyOfRange(0, signature.size).contentEquals(signature)
        ) {
            throw IllegalArgumentException("파일 내용이 선언된 형식과 일치하지 않습니다: $contentType")
        }

        // 3. R2에 업로드
        val url = memeImageStorage.uploadOgImage(memeId.toString(), bytes, contentType)
        
        // 4. DB 업데이트 (존재 여부 및 소유권은 Controller에서 이미 검증 완료)
        userMemeRepository.updateOgImageUrl(memeId, url)
        
        return url
    }
}
