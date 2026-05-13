package com.pickameme.domain.mission

import java.util.UUID

interface MissionShareLogRepository {
    fun save(log: MissionShareLog): MissionShareLog
    fun countByUserIdAndPeriodKey(userId: UUID, periodKey: String): Int
}
