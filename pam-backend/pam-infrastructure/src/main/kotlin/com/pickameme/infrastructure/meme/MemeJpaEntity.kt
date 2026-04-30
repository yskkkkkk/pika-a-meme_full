package com.pickameme.infrastructure.meme

import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.CanvasState
import com.pickameme.domain.meme.MemeCreationOption
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "memes")
class MemeJpaEntity(

    @Id
    val id: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "image_key", nullable = false, length = 500)
    val imageKey: String,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "canvas_state", columnDefinition = "jsonb", nullable = false)
    val canvasState: CanvasState,

    @Enumerated(EnumType.STRING)
    @Column(name = "creation_option", nullable = false, length = 20)
    val creationOption: MemeCreationOption,

    @Enumerated(EnumType.STRING)
    @Column(name = "heart_type", nullable = false, length = 20)
    val heartType: HeartType,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime
)
