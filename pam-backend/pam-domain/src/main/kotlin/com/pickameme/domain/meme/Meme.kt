package com.pickameme.domain.meme

import com.pickameme.domain.heart.HeartType
import java.time.LocalDateTime
import java.util.UUID

class Meme(
    val id: UUID,
    val userId: UUID,
    val imageKey: String,
    val canvasState: CanvasState,
    val creationOption: MemeCreationOption,
    val heartType: HeartType,
    val createdAt: LocalDateTime
) {
    companion object {
        fun create(
            userId: UUID,
            imageKey: String,
            canvasState: CanvasState,
            creationOption: MemeCreationOption,
            heartType: HeartType
        ): Meme {
            MemeCreationPolicy.validate(canvasState, creationOption)
            return Meme(
                id = UUID.randomUUID(),
                userId = userId,
                imageKey = imageKey,
                canvasState = canvasState,
                creationOption = creationOption,
                heartType = heartType,
                createdAt = LocalDateTime.now()
            )
        }
    }
}
