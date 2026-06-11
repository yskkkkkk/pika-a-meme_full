package com.pickameme.api.meme

import com.pickameme.domain.heart.HeartType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

data class SaveCompositionRequest(
    val imageId: UUID,
    val phraseId: UUID,
    val heartType: HeartType,
    @field:NotBlank @field:Size(max = 500) val imageUrl: String,
    @field:NotBlank @field:Size(max = 50) val subjectPosition: String,
    @field:NotBlank @field:Size(max = 200) val phrase: String,
    @field:Size(max = 20) val selectedTag: String?,
)

data class SaveCompositionResponse(
    val memeId: UUID,
)
