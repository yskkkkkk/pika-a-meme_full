package com.pickameme.api.meme

import com.pickameme.domain.heart.HeartType
import java.util.UUID

data class SaveCompositionRequest(
    val imageId: UUID,
    val phraseId: UUID,
    val heartType: HeartType,
    val imageUrl: String,
    val subjectPosition: String,
    val phrase: String,
    val selectedTag: String?,
)

data class SaveCompositionResponse(
    val memeId: UUID,
)
