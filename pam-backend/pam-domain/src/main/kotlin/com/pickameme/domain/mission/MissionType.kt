package com.pickameme.domain.mission

enum class MissionType {
    ONE_TIME,       // 최초 1회 달성
    DAILY,          // 매일 자정 리셋
    WEEKLY_SHARE,   // 해당 주 3회 공유마다 지급
    STREAK_3DAYS,   // 3일 연속 방문, 달성 시 streak 리셋 후 재도전
    HIDDEN          // 미달성 시 목록 미노출, 달성 시 제목에 근거 명시
}
