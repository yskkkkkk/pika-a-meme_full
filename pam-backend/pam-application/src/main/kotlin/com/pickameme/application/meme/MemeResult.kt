package com.pickameme.application.meme

import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.MemeCreationOption
import java.time.LocalDateTime
import java.util.UUID

data class MemeResult(
    val id: UUID,
    val userId: UUID,
    val imageUrl: String,
    val canvasState: CanvasState,
    val creationOption: MemeCreationOption,
    val heartType: HeartType,
    val createdAt: LocalDateTime
)
