package com.pickameme.application.meme

import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.MemeImageRepository
import com.pickameme.domain.meme.MemePhraseRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MemeComposeService(
    private val memeImageRepository: MemeImageRepository,
    private val memePhraseRepository: MemePhraseRepository
) {

    @Transactional(readOnly = true)
    fun compose(heartType: HeartType, tags: List<String>): MemeComposeResult {
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

        return MemeComposeResult(
            imagePresignedUrl = image.imageUrl, // Assuming imageUrl is already a usable URL or will be handled
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
