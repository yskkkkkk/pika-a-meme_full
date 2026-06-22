package com.pickameme.application.mission

import com.pickameme.application.heart.HeartService
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.mission.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.WeekFields
import java.util.UUID

@Service
class MissionService(
    private val missionRepository: MissionRepository,
    private val completionRepository: MissionCompletionRepository,
    private val shareLogRepository: MissionShareLogRepository,
    private val visitStreakRepository: MissionVisitStreakRepository,
    private val heartService: HeartService
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // ── 외부 진입점: 모든 트리거는 이 메서드 하나로 ──────────────────────
    @Transactional
    fun trigger(userId: UUID, trigger: MissionTrigger) {
        when (trigger) {
            is MissionTrigger.Register  -> checkFirstLogin(userId)
            is MissionTrigger.Visit     -> { checkDailyVisit(userId); checkStreak(userId) }
            is MissionTrigger.Share     -> { logShare(userId, trigger.shareType); checkShareMissions(userId) }
            is MissionTrigger.MemeSaved -> { checkGallery(userId, trigger.totalMemeCount); checkHiddenTheme(userId, trigger.selectedTag) }
        }
    }

    // ── 미션 목록 조회 ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    fun getMissionsForUser(userId: UUID): List<MissionStatusDto> {
        val allMissions = missionRepository.findAll().sortedWith(
            compareBy(nullsLast()) { it.displayOrder }
        )
        val completionsByMission = completionRepository.findByUserId(userId)
            .groupBy { it.missionId }  // O(C) 한 번 — 이후 모든 조회는 O(1)
        val today = todayKey()
        val thisWeek = weekKey(LocalDateTime.now())

        return buildList {
            // 비히든 미션: 항상 포함
            allMissions.filter { !it.isHidden }.forEach { mission ->
                add(buildStatus(userId, mission, completionsByMission, today, thisWeek))
            }
            // 히든 미션: 달성한 것만 포함
            allMissions.filter { it.isHidden }.forEach { mission ->
                completionsByMission[mission.id].orEmpty().forEach { completion ->
                    add(MissionStatusDto(
                        id = mission.id,
                        type = mission.type,
                        title = mission.title,
                        description = mission.description,
                        rewardAmount = mission.rewardAmount,
                        isHidden = true,
                        status = MissionStatus.DONE,
                        progress = null,
                        completedAt = completion.completedAt,
                        periodKey = completion.periodKey
                    ))
                }
            }
        }
    }

    // ── 개별 체크 로직 ────────────────────────────────────────────────────

    private fun checkFirstLogin(userId: UUID) =
        grantIfNotDone(userId, "FIRST_LOGIN", periodKey = null)

    private fun checkDailyVisit(userId: UUID) =
        grantIfNotDone(userId, "DAILY_VISIT", periodKey = todayKey())

    private fun checkStreak(userId: UUID) {
        val today = LocalDate.now()
        val streak = visitStreakRepository.findByUserId(userId)
            ?: MissionVisitStreak(userId, 0, null, LocalDateTime.now())

        val updated = when (streak.lastVisitDate) {
            today           -> streak                          // 오늘 이미 방문
            today.minusDays(1) -> streak.copy(currentStreak = streak.currentStreak + 1, lastVisitDate = today, updatedAt = LocalDateTime.now())
            else            -> streak.copy(currentStreak = 1, lastVisitDate = today, updatedAt = LocalDateTime.now())
        }
        visitStreakRepository.save(updated)

        if (updated.currentStreak == 3) {
            grant(userId, "STREAK_3DAYS", periodKey = null, rewardAmount = 1)
            // streak 리셋: 달성 후 0으로 초기화
            visitStreakRepository.save(updated.copy(currentStreak = 0, updatedAt = LocalDateTime.now()))
        }
    }

    private fun logShare(userId: UUID, shareType: MissionShareLog.ShareType) {
        shareLogRepository.save(
            MissionShareLog(UUID.randomUUID(), userId, shareType, LocalDateTime.now())
        )
    }

    private fun checkShareMissions(userId: UUID) {
        // 최초 공유 (1회성)
        grantIfNotDone(userId, "SHARE_STORY_FIRST", periodKey = null)

        // 주간 3회 공유마다 1회 지급
        val thisWeek = weekKey(LocalDateTime.now())
        val shareCount = shareLogRepository.countByUserIdAndPeriodKey(userId, thisWeek)
        val grantedCount = completionRepository.countByUserIdAndMissionIdAndPeriodKey(userId, "SHARE_STORY_WEEKLY", thisWeek)
        if (shareCount / 3 > grantedCount) {
            grant(userId, "SHARE_STORY_WEEKLY", periodKey = thisWeek, rewardAmount = 1)
        }
    }

    private fun checkGallery(userId: UUID, totalCount: Long) {
        if (totalCount >= 10) grantIfNotDone(userId, "GALLERY_10", periodKey = null)
        if (totalCount >= 30) grantIfNotDone(userId, "GALLERY_30", periodKey = null)
    }

    private fun checkHiddenTheme(userId: UUID, selectedTag: String?) {
        if (selectedTag == null) return
        val missionId = "HIDDEN_THEME_$selectedTag"
        if (missionRepository.findById(missionId) == null) return   // 등록되지 않은 태그
        grantIfNotDone(userId, missionId, periodKey = null, metadata = mapOf("tag" to selectedTag))
    }

    // ── 공통 지급 헬퍼 ────────────────────────────────────────────────────

    private fun grantIfNotDone(
        userId: UUID,
        missionId: String,
        periodKey: String?,
        metadata: Map<String, String> = emptyMap()
    ) {
        if (completionRepository.existsByUserIdAndMissionIdAndPeriodKey(userId, missionId, periodKey)) return
        val mission = missionRepository.findById(missionId) ?: return
        grant(userId, missionId, periodKey, mission.rewardAmount, metadata)
    }

    private fun grant(
        userId: UUID,
        missionId: String,
        periodKey: String?,
        rewardAmount: Int = missionRepository.findById(missionId)?.rewardAmount ?: 1,
        metadata: Map<String, String> = emptyMap()
    ) {
        heartService.grantSpecialHeart(userId, rewardAmount)
        completionRepository.save(
            MissionCompletion(
                id = UUID.randomUUID(),
                userId = userId,
                missionId = missionId,
                completedAt = LocalDateTime.now(),
                periodKey = periodKey,
                rewardGranted = rewardAmount,
                metadata = metadata
            )
        )
        log.info("미션 달성: userId=$userId, missionId=$missionId, reward=$rewardAmount")
    }

    // ── 날짜 키 유틸 ──────────────────────────────────────────────────────

    private fun todayKey(): String = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

    private fun weekKey(dt: LocalDateTime): String {
        val week = dt.toLocalDate().get(WeekFields.ISO.weekOfWeekBasedYear())
        val year = dt.toLocalDate().get(WeekFields.ISO.weekBasedYear())
        return "$year-W${week.toString().padStart(2, '0')}"
    }

    private fun buildStatus(
        userId: UUID,
        mission: Mission,
        completionsByMission: Map<String, List<MissionCompletion>>,
        today: String,
        thisWeek: String
    ): MissionStatusDto {
        val missionCompletions = completionsByMission[mission.id].orEmpty()  // O(1)

        val status = when (mission.type) {
            MissionType.ONE_TIME -> {
                if (missionCompletions.any { it.periodKey == null }) MissionStatus.DONE
                else MissionStatus.ACTIVE
            }
            MissionType.DAILY -> {
                if (missionCompletions.any { it.periodKey == today }) MissionStatus.DONE
                else MissionStatus.ACTIVE
            }
            MissionType.WEEKLY_SHARE -> {
                val weeklyCount = missionCompletions.count { it.periodKey == thisWeek }
                if (weeklyCount > 0) MissionStatus.DONE else MissionStatus.ACTIVE
            }
            MissionType.STREAK_3DAYS -> MissionStatus.PROGRESS
            MissionType.HIDDEN -> MissionStatus.ACTIVE
        }

        val progress = if (mission.type == MissionType.STREAK_3DAYS) {
            val streak = visitStreakRepository.findByUserId(userId)
            ProgressDto(streak?.currentStreak ?: 0, 3)
        } else null

        val completedAt = missionCompletions.lastOrNull()?.completedAt

        return MissionStatusDto(
            id = mission.id,
            type = mission.type,
            title = mission.title,
            description = mission.description,
            rewardAmount = mission.rewardAmount,
            isHidden = false,
            status = status,
            progress = progress,
            completedAt = completedAt,
            periodKey = null
        )
    }
}
