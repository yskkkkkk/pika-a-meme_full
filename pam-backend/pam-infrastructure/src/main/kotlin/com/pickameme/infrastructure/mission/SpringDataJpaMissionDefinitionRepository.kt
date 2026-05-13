package com.pickameme.infrastructure.mission

import org.springframework.data.jpa.repository.JpaRepository

interface SpringDataJpaMissionDefinitionRepository : JpaRepository<MissionDefinitionJpaEntity, String>
