package com.pickameme.application.meme

import com.pickameme.application.mission.MissionService
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.MemeComposition
import com.pickameme.domain.meme.UserMeme
import com.pickameme.domain.meme.UserMemeRepository
import com.pickameme.domain.mission.MissionTrigger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class SaveCompositionService(
    private val userMemeRepository: UserMemeRepository,
    private val missionService: MissionService,
) {
    @Transactional
    fun save(command: SaveCompositionCommand): UUID {
        val memeId = UUID.randomUUID()
        userMemeRepository.save(
            UserMeme(
                id = memeId,
                userId = command.userId,
                imageId = command.imageId,
                phraseId = command.phraseId,
                heartType = command.heartType,
                composition = MemeComposition(
                    imageUrl = command.imageUrl,
                    subjectPosition = command.subjectPosition,
                    phraseText = command.phrase,
                ),
                selectedTag = command.selectedTag,
                matchedTags = emptyList(),
                createdAt = LocalDateTime.now()
            )
        )
        val totalCount = userMemeRepository.countAllByUserId(command.userId)
        missionService.trigger(command.userId, MissionTrigger.MemeSaved(totalCount, command.selectedTag))
        return memeId
    }
}

data class SaveCompositionCommand(
    val userId: UUID,
    val imageId: UUID,
    val phraseId: UUID,
    val heartType: HeartType,
    val imageUrl: String,
    val subjectPosition: String,
    val phrase: String,
    val selectedTag: String?,
)
