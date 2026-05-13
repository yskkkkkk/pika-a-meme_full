package com.pickameme.domain.mission

interface MissionRepository {
    fun findAll(): List<Mission>
    fun findById(id: String): Mission?
}
