package com.pickameme.domain.meme

import com.pickameme.domain.exception.MemeCreationPolicyViolationException
import com.pickameme.domain.heart.HeartType
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.assertj.core.api.Assertions.assertThatCode
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.util.UUID

class MemeCreationPolicyTest {

    private fun textItem(fontFamily: String = CanvasState.DEFAULT_FONT) = CanvasState.TextItem(
        content = "킹받는 문구",
        x = 250.0, y = 400.0,
        fontSize = 32,
        fontFamily = fontFamily,
        color = "#000000"
    )

    private fun stickerItem() = CanvasState.StickerItem(
        stickerId = "star-01",
        x = 100.0, y = 100.0,
        scale = 1.0
    )

    @Nested
    @DisplayName("BASIC 정책")
    inner class BasicPolicy {

        @Test
        @DisplayName("텍스트 1개, 기본 폰트, 스티커 없음 → 성공")
        fun `valid basic canvas passes`() {
            val canvas = CanvasState("template-01", listOf(textItem()), emptyList())
            assertThatCode { MemeCreationPolicy.validate(canvas, MemeCreationOption.BASIC) }
                .doesNotThrowAnyException()
        }

        @Test
        @DisplayName("텍스트 없음 → 실패")
        fun `no text fails`() {
            val canvas = CanvasState("template-01", emptyList(), emptyList())
            assertThatThrownBy { MemeCreationPolicy.validate(canvas, MemeCreationOption.BASIC) }
                .isInstanceOf(MemeCreationPolicyViolationException::class.java)
                .hasMessageContaining("최소 1개")
        }

        @Test
        @DisplayName("텍스트 2개 → 실패")
        fun `two texts fail`() {
            val canvas = CanvasState("template-01", listOf(textItem(), textItem()), emptyList())
            assertThatThrownBy { MemeCreationPolicy.validate(canvas, MemeCreationOption.BASIC) }
                .isInstanceOf(MemeCreationPolicyViolationException::class.java)
                .hasMessageContaining("1개까지만")
        }

        @Test
        @DisplayName("스티커 사용 → 실패")
        fun `sticker usage fails`() {
            val canvas = CanvasState("template-01", listOf(textItem()), listOf(stickerItem()))
            assertThatThrownBy { MemeCreationPolicy.validate(canvas, MemeCreationOption.BASIC) }
                .isInstanceOf(MemeCreationPolicyViolationException::class.java)
                .hasMessageContaining("스티커")
        }

        @Test
        @DisplayName("커스텀 폰트 사용 → 실패")
        fun `custom font fails`() {
            val canvas = CanvasState("template-01", listOf(textItem(fontFamily = "NanumGothic")), emptyList())
            assertThatThrownBy { MemeCreationPolicy.validate(canvas, MemeCreationOption.BASIC) }
                .isInstanceOf(MemeCreationPolicyViolationException::class.java)
                .hasMessageContaining("기본 폰트")
        }
    }

    @Nested
    @DisplayName("SPECIAL 정책")
    inner class SpecialPolicy {

        @Test
        @DisplayName("텍스트 여러개, 스티커, 커스텀 폰트 → 성공")
        fun `valid special canvas passes`() {
            val canvas = CanvasState(
                templateId = "template-special-01",
                textItems = listOf(textItem("NanumGothic"), textItem("default")),
                stickerItems = listOf(stickerItem())
            )
            assertThatCode { MemeCreationPolicy.validate(canvas, MemeCreationOption.SPECIAL) }
                .doesNotThrowAnyException()
        }

        @Test
        @DisplayName("텍스트 없음 → 실패")
        fun `no text fails`() {
            val canvas = CanvasState("template-special-01", emptyList(), listOf(stickerItem()))
            assertThatThrownBy { MemeCreationPolicy.validate(canvas, MemeCreationOption.SPECIAL) }
                .isInstanceOf(MemeCreationPolicyViolationException::class.java)
                .hasMessageContaining("최소 1개")
        }
    }

    @Nested
    @DisplayName("Meme.create 불변식")
    inner class MemeCreate {

        @Test
        @DisplayName("정책 위반 시 Meme 생성 자체가 실패")
        fun `meme create enforces policy`() {
            val canvas = CanvasState("template-01", emptyList(), emptyList())
            assertThatThrownBy {
                Meme.create(
                    userId = UUID.randomUUID(),
                    imageKey = "images/test.webp",
                    canvasState = canvas,
                    creationOption = MemeCreationOption.BASIC,
                    heartType = HeartType.BASIC
                )
            }.isInstanceOf(MemeCreationPolicyViolationException::class.java)
        }

        @Test
        @DisplayName("정책 통과 시 Meme id와 createdAt 자동 생성")
        fun `meme create sets id and createdAt`() {
            val canvas = CanvasState("template-01", listOf(textItem()), emptyList())
            val meme = Meme.create(
                userId = UUID.randomUUID(),
                imageKey = "images/test.webp",
                canvasState = canvas,
                creationOption = MemeCreationOption.BASIC,
                heartType = HeartType.BASIC
            )
            assertThatCode { meme.id }.doesNotThrowAnyException()
            assertThatCode { meme.createdAt }.doesNotThrowAnyException()
        }
    }
}
