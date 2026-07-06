package com.pickameme.application.meme

import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.domain.meme.UserMemeRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class UploadOgImageServiceTest {

    private lateinit var memeImageStorage: MemeImageStorage
    private lateinit var userMemeRepository: UserMemeRepository
    private lateinit var service: UploadOgImageService

    private val memeId = UUID.randomUUID()

    // 실제 파일 시그니처 (매직 바이트)
    private val jpegBytes = byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte(), 0xE0.toByte()) + ByteArray(16)
    private val pngBytes = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A) + ByteArray(16)

    @BeforeEach
    fun setUp() {
        memeImageStorage = mock()
        userMemeRepository = mock()
        service = UploadOgImageService(memeImageStorage, userMemeRepository)
    }

    @Test
    @DisplayName("정상 JPEG 바이트 + image/jpeg 선언이면 업로드에 성공한다")
    fun uploadJpegSuccess() {
        whenever(memeImageStorage.uploadOgImage(any(), any(), any())).thenReturn("https://img.test/og.jpg")

        val url = service.upload(memeId, jpegBytes, "image/jpeg")

        assertThat(url).isEqualTo("https://img.test/og.jpg")
        verify(userMemeRepository).updateOgImageUrl(memeId, "https://img.test/og.jpg")
    }

    @Test
    @DisplayName("정상 PNG 바이트 + image/png 선언이면 업로드에 성공한다")
    fun uploadPngSuccess() {
        whenever(memeImageStorage.uploadOgImage(any(), any(), any())).thenReturn("https://img.test/og.png")

        val url = service.upload(memeId, pngBytes, "image/png")

        assertThat(url).isEqualTo("https://img.test/og.png")
    }

    @Test
    @DisplayName("지원하지 않는 Content-Type이면 거부한다")
    fun rejectUnsupportedContentType() {
        assertThatThrownBy { service.upload(memeId, jpegBytes, "image/gif") }
            .isInstanceOf(IllegalArgumentException::class.java)

        verify(memeImageStorage, never()).uploadOgImage(any(), any(), any())
    }

    @Test
    @DisplayName("image/png 선언이지만 실제 바이트가 JPEG이면 거부한다 (Content-Type 위조)")
    fun rejectForgedContentType() {
        assertThatThrownBy { service.upload(memeId, jpegBytes, "image/png") }
            .isInstanceOf(IllegalArgumentException::class.java)

        verify(memeImageStorage, never()).uploadOgImage(any(), any(), any())
    }

    @Test
    @DisplayName("이미지 시그니처가 아닌 바이트(스크립트 등)면 거부한다")
    fun rejectNonImageBytes() {
        val scriptBytes = "<script>alert(1)</script>".toByteArray()

        assertThatThrownBy { service.upload(memeId, scriptBytes, "image/png") }
            .isInstanceOf(IllegalArgumentException::class.java)

        verify(memeImageStorage, never()).uploadOgImage(any(), any(), any())
    }

    @Test
    @DisplayName("시그니처 길이보다 짧은 바이트면 거부한다")
    fun rejectTooShortBytes() {
        val tinyBytes = byteArrayOf(0x89.toByte(), 0x50)

        assertThatThrownBy { service.upload(memeId, tinyBytes, "image/png") }
            .isInstanceOf(IllegalArgumentException::class.java)

        verify(memeImageStorage, never()).uploadOgImage(any(), any(), any())
    }
}
