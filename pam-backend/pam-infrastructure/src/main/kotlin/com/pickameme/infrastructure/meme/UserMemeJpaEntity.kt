package com.pickameme.infrastructure.meme

import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.MemeComposition
import com.pickameme.domain.meme.UserMeme
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "user_memes")
class UserMemeJpaEntity(

    @Id
    val id: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "image_id", nullable = false)
    val imageId: UUID,

    @Column(name = "phrase_id", nullable = false)
    val phraseId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "heart_type", nullable = false, length = 10)
    val heartType: HeartType,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    val composition: MemeComposition,

    @Column(name = "selected_tag", nullable = true, length = 20)
    val selectedTag: String?,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matched_tags", columnDefinition = "jsonb", nullable = false)
    val matchedTags: List<String> = emptyList(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime,

    @Column(name = "enabled", nullable = false)
    val enabled: Boolean = true,

    @Column(name = "og_image_url", nullable = true, length = 255)
    val ogImageUrl: String? = null
) {
    fun toDomain() = UserMeme(
        id = id,
        userId = userId,
        imageId = imageId,
        phraseId = phraseId,
        heartType = heartType,
        composition = composition,
        selectedTag = selectedTag,
        matchedTags = matchedTags,
        createdAt = createdAt,
        enabled = enabled,
        ogImageUrl = ogImageUrl
    )
}
