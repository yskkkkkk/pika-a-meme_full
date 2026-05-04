package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.MemeImage
import com.pickameme.domain.meme.SubjectPosition
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "meme_images")
class MemeImageJpaEntity(

    @Id
    val id: UUID,

    @Column(name = "image_url", nullable = false)
    val imageUrl: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_position", nullable = false, length = 20)
    val subjectPosition: SubjectPosition,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    val tags: List<String>,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime
) {
    fun toDomain() = MemeImage(
        id = id,
        imageUrl = imageUrl,
        subjectPosition = subjectPosition,
        tags = tags,
        createdAt = createdAt
    )
}
