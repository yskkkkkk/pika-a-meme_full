package com.pickameme.infrastructure.mission

import com.pickameme.domain.mission.MissionVisitStreak
import com.pickameme.domain.mission.MissionVisitStreakRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaMissionVisitStreakRepositoryAdapter(
    private val jpa: SpringDataJpaMissionVisitStreakRepository
) : MissionVisitStreakRepository {

    override fun findByUserId(userId: UUID): MissionVisitStreak? =
        jpa.findById(userId).orElse(null)?.toDomain()

    override fun save(streak: MissionVisitStreak): MissionVisitStreak =
        jpa.save(MissionVisitStreakJpaEntity.from(streak)).toDomain()
}
