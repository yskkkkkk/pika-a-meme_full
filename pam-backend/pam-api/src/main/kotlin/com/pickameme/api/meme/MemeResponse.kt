package com.pickameme.api.meme

import com.pickameme.application.meme.MemeResult
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.MemeCreationOption
import java.time.LocalDateTime
import java.util.UUID

data class MemeResponse(
    val id: UUID,
    val userId: UUID,
    val imageUrl: String,
    val canvasState: CanvasState,
    val creationOption: MemeCreationOption,
    val heartType: HeartType,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(result: MemeResult) = MemeResponse(
            id = result.id,
            userId = result.userId,
            imageUrl = result.imageUrl,
            canvasState = result.canvasState,
            creationOption = result.creationOption,
            heartType = result.heartType,
            createdAt = result.createdAt
        )
    }
}
