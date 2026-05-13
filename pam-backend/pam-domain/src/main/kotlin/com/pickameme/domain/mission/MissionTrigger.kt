package com.pickameme.domain.mission

sealed class MissionTrigger {
    object Register : MissionTrigger()
    object Visit : MissionTrigger()
    data class Share(val shareType: MissionShareLog.ShareType) : MissionTrigger()
    data class MemeSaved(
        val totalMemeCount: Long,
        val selectedTag: String?
    ) : MissionTrigger()
}
