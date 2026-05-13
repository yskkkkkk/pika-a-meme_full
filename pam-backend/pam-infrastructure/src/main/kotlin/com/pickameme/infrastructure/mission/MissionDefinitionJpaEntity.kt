package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.Mission
import com.pickameme.domain.mission.MissionType
import jakarta.persistence.*

@Entity
@Table(name = "mission_definitions")
class MissionDefinitionJpaEntity(
    @Id
    @Column(name = "id", length = 60)
    val id: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 30, nullable = false)
    val type: MissionType,

    @Column(name = "title", length = 100, nullable = false)
    val title: String,

    @Column(name = "description", length = 200, nullable = false)
    val description: String,

    @Column(name = "reward_amount", nullable = false)
    val rewardAmount: Int,

    @Column(name = "is_hidden", nullable = false)
    val isHidden: Boolean,

    @Column(name = "display_order")
    val displayOrder: Int?
) {
    fun toDomain() = Mission(
        id = id,
        type = type,
        title = title,
        description = description,
        rewardAmount = rewardAmount,
        isHidden = isHidden,
        displayOrder = displayOrder
    )
}
