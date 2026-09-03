package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.MemePhrase
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "meme_phrases")
class MemePhrasJpaEntity(

    @Id
    val id: UUID,

    @Column(nullable = false)
    val text: String,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    val tags: List<String>,

    @Column(nullable = false)
    val language: String,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime
) {
    fun toDomain() = MemePhrase(
        id = id,
        text = text,
        tags = tags,
        language = language,
        createdAt = createdAt
    )
}
