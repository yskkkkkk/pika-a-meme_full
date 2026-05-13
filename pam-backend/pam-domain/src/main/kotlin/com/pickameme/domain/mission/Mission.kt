package com.pickameme.domain.mission

data class Mission(
    val id: String,
    val type: MissionType,
    val title: String,
    val description: String,
    val rewardAmount: Int,
    val isHidden: Boolean,
    val displayOrder: Int?
)
