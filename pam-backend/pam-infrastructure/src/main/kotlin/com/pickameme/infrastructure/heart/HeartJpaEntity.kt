package com.pickameme.infrastructure.heart

import com.pickameme.domain.heart.Heart
import com.pickameme.domain.heart.HeartType
import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

// SPECIAL 하트 전용 JPA 엔티티
@Entity
@Table(
    name = "hearts",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "type"])]
)
class HeartJpaEntity(
    @Id
    @Column(name = "id", columnDefinition = "uuid")
    val id: UUID,

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    val type: HeartType,

    @Column(name = "count", nullable = false)
    var count: Int,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun toDomain(): Heart = Heart(
        id = id,
        userId = userId,
        type = type,
        count = count,
        lastChargedAt = null
    )

    companion object {
        fun from(heart: Heart): HeartJpaEntity = HeartJpaEntity(
            id = heart.id,
            userId = heart.userId,
            type = heart.type,
            count = heart.count
        )
    }
}
