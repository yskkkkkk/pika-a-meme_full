package com.pickameme.domain.meme

import com.pickameme.domain.heart.HeartType
import java.time.LocalDateTime
import java.util.UUID

data class MemeComposition(
    val imageUrl: String,
    val subjectPosition: String,
    val phraseText: String
)

data class UserMeme(
    val id: UUID,
    val userId: UUID,
    val imageId: UUID,
    val phraseId: UUID,
    val heartType: HeartType,
    val composition: MemeComposition,
    val createdAt: LocalDateTime
)
