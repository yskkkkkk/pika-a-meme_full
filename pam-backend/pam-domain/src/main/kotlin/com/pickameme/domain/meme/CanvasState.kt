package com.pickameme.domain.meme

data class CanvasState(
    val templateId: String,
    val textItems: List<TextItem>,
    val stickerItems: List<StickerItem>
) {
    data class TextItem(
        val content: String,
        val x: Double,
        val y: Double,
        val fontSize: Int,
        val fontFamily: String,
        val color: String
    )

    data class StickerItem(
        val stickerId: String,
        val x: Double,
        val y: Double,
        val scale: Double
    )

    companion object {
        const val DEFAULT_FONT = "default"
    }
}
