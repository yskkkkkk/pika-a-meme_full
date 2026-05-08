package com.pickameme.api.meme

import com.pickameme.domain.meme.UserMeme
import java.time.LocalDateTime
import java.util.UUID

data class UserMemeResponse(
    val id: UUID,
    val imageUrl: String,
    val subjectPosition: String,
    val phraseText: String,
    val heartType: String,
    val selectedTag: String?,
    val createdAt: LocalDateTime,
    val enabled: Boolean
) {
    companion object {
        fun from(userMeme: UserMeme) = UserMemeResponse(
            id = userMeme.id,
            imageUrl = userMeme.composition.imageUrl,
            subjectPosition = userMeme.composition.subjectPosition,
            phraseText = userMeme.composition.phraseText,
            heartType = userMeme.heartType.name,
            selectedTag = userMeme.selectedTag,
            createdAt = userMeme.createdAt,
            enabled = userMeme.enabled
        )
    }
}
