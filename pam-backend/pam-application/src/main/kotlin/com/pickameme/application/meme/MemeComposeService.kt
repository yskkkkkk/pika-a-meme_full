package com.pickameme.application.meme

import com.pickameme.application.heart.HeartService
import com.pickameme.application.mission.MissionService
import com.pickameme.domain.common.LockManager
import com.pickameme.domain.exception.MemeSourceNotFoundException
import com.pickameme.domain.heart.HeartType
import com.pickameme.domain.meme.MemeComposition
import com.pickameme.domain.meme.MemeImageRepository
import com.pickameme.domain.meme.MemePhrase
import com.pickameme.domain.meme.MemePhraseRepository
import com.pickameme.domain.meme.UserMeme
import com.pickameme.domain.meme.UserMemeRepository
import com.pickameme.domain.mission.MissionTrigger
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import java.time.LocalDateTime
import java.util.UUID

@Service
class MemeComposeService(
    private val memeImageRepository: MemeImageRepository,
    private val memePhraseRepository: MemePhraseRepository,
    private val userMemeRepository: UserMemeRepository,
    private val heartService: HeartService,
    private val missionService: MissionService,
    private val lockManager: LockManager,
    private val transactionManager: PlatformTransactionManager
) {
    private val transactionTemplate = TransactionTemplate(transactionManager)

    fun compose(heartType: HeartType, tags: List<String>, userId: UUID?, language: String = "ko"): MemeComposeResult {
        return if (userId != null) {
            lockManager.withLock("lock:meme_compose:$userId") {
                transactionTemplate.execute {
                    executeCompose(heartType, tags, userId, language)
                }!!
            }
        } else {
            executeCompose(heartType, tags, null, language)
        }
    }

    private fun executeCompose(heartType: HeartType, tags: List<String>, userId: UUID?, language: String): MemeComposeResult {
        // 1단계: 이미지/문구 조합 (순수 조회 — 실패 시 하트 차감 없음)
        val image = if (heartType == HeartType.SPECIAL && tags.isNotEmpty()) {
            memeImageRepository.findRandomByTags(tags) ?: memeImageRepository.findRandom()
        } else {
            memeImageRepository.findRandom()
        }

        val phrase = findPhrase(heartType, tags, language)

        // 2단계: 로그인 유저 하트 차감 (부족 시 InsufficientHeartException → 400, DB 저장 없음)
        if (userId != null) {
            heartService.consumeHeart(userId, heartType)
        }

        var generatedMemeId: UUID? = null

        // 3단계: DB 저장
        if (userId != null) {
            val matchedTags = image.tags.intersect(phrase.tags.toSet()).toList()
            generatedMemeId = UUID.randomUUID()
            userMemeRepository.save(
                UserMeme(
                    id = generatedMemeId,
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
            val totalCount = userMemeRepository.countAllByUserId(userId)
            missionService.trigger(userId, MissionTrigger.MemeSaved(totalCount, tags.firstOrNull()))
        }

        return MemeComposeResult(
            memeId = generatedMemeId,
            imagePresignedUrl = image.imageUrl,
            subjectPosition = image.subjectPosition.name,
            phrase = phrase.text,
            imageId = image.id,
            phraseId = phrase.id,
            phraseLanguage = phrase.language
        )
    }

    // 요청 언어에 태그 매칭/전체 문구가 없으면 ko로 fallback (서비스 중단 방지)
    private fun findPhrase(heartType: HeartType, tags: List<String>, language: String): MemePhrase {
        val byTags = if (heartType == HeartType.SPECIAL && tags.isNotEmpty()) {
            memePhraseRepository.findRandomByLanguageAndTags(language, tags)
        } else {
            null
        }
        if (byTags != null) return byTags

        return try {
            memePhraseRepository.findRandomByLanguage(language)
        } catch (e: MemeSourceNotFoundException) {
            if (language == "ko") throw e
            memePhraseRepository.findRandomByLanguage("ko")
        }
    }
}

data class MemeComposeResult(
    val memeId: UUID?,
    val imagePresignedUrl: String,
    val subjectPosition: String,
    val phrase: String,
    val imageId: UUID,
    val phraseId: UUID,
    val phraseLanguage: String
)
