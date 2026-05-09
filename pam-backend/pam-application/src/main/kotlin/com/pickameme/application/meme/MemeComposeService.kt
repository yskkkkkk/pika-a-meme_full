package com.pickameme.application.meme

import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.MemeComposition
import com.pickameme.domain.meme.MemeImageRepository
import com.pickameme.domain.meme.MemePhraseRepository
import com.pickameme.domain.meme.UserMeme
import com.pickameme.domain.meme.UserMemeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class MemeComposeService(
    private val memeImageRepository: MemeImageRepository,
    private val memePhraseRepository: MemePhraseRepository,
    private val userMemeRepository: UserMemeRepository
) {

    @Transactional
    fun compose(heartType: HeartType, tags: List<String>, userId: UUID?): MemeComposeResult {
        val image = if (heartType == HeartType.SPECIAL && tags.isNotEmpty()) {
            memeImageRepository.findRandomByTags(tags) ?: memeImageRepository.findRandom()
        } else {
            memeImageRepository.findRandom()
        }

        val phrase = if (heartType == HeartType.SPECIAL && tags.isNotEmpty()) {
            memePhraseRepository.findRandomByTags(tags) ?: memePhraseRepository.findRandom()
        } else {
            memePhraseRepository.findRandom()
        }

        if (userId != null) {
            val matchedTags = image.tags.intersect(phrase.tags.toSet()).toList()
            userMemeRepository.save(
                UserMeme(
                    id = UUID.randomUUID(),
                    userId = userId,
                    imageId = image.id,
                    phraseId = phrase.id,
                    heartType = heartType,
                    composition = MemeComposition(
                        imageUrl = image.imageUrl,
                        subjectPosition = image.subjectPosition.name,
                        phraseText = phrase.text
                    ),
                    selectedTag = tags.firstOrNull(),
                    matchedTags = matchedTags,
                    createdAt = LocalDateTime.now()
                )
            )
        }

        return MemeComposeResult(
            imagePresignedUrl = image.imageUrl,
            subjectPosition = image.subjectPosition.name,
            phrase = phrase.text
        )
    }
}

data class MemeComposeResult(
    val imagePresignedUrl: String,
    val subjectPosition: String,
    val phrase: String
)
