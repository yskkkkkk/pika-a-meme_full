package com.pickameme.domain.meme

import java.time.LocalDateTime
import java.util.UUID

data class MemePhrase(
    val id: UUID,
    val text: String,
    val tags: List<String>,
    val language: String,
    val createdAt: LocalDateTime
)
