package com.pickameme.application.meme

import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.MemeCreationOption
import java.util.UUID

data class CreateMemeCommand(
    val userId: UUID,
    val imageData: ByteArray,
    val contentType: String = "image/webp",
    val canvasState: CanvasState,
    val creationOption: MemeCreationOption,
    val heartType: HeartType
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is CreateMemeCommand) return false
        return userId == other.userId &&
            contentType == other.contentType &&
            canvasState == other.canvasState &&
            creationOption == other.creationOption &&
            heartType == other.heartType
    }

    override fun hashCode(): Int = userId.hashCode()
}
