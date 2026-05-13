package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.Mission
import com.pickameme.domain.mission.MissionRepository
import org.springframework.stereotype.Repository

@Repository
class JpaMissionRepositoryAdapter(
    private val jpa: SpringDataJpaMissionDefinitionRepository
) : MissionRepository {
    override fun findAll(): List<Mission> = jpa.findAll().map { it.toDomain() }
    override fun findById(id: String): Mission? = jpa.findById(id).orElse(null)?.toDomain()
}
