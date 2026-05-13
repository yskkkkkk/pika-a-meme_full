package com.pickameme.infrastructure.mission

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SpringDataJpaMissionVisitStreakRepository : JpaRepository<MissionVisitStreakJpaEntity, UUID>
