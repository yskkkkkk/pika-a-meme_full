package com.pickameme.domain.meme

import java.time.LocalDateTime
import java.util.UUID

data class MemeImage(
    val id: UUID,
    val imageUrl: String,
    val subjectPosition: SubjectPosition,
    val tags: List<String>,
    val createdAt: LocalDateTime
)
