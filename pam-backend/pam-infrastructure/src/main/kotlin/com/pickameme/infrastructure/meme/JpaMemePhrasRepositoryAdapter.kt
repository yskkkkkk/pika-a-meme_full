package com.pickameme.infrastructure.meme

import com.pickameme.domain.exception.MemeSourceNotFoundException
import com.pickameme.domain.meme.MemePhrase
import com.pickameme.domain.meme.MemePhraseRepository
import org.springframework.stereotype.Repository

@Repository
class JpaMemePhrasRepositoryAdapter(
    private val jpaRepository: SpringDataJpaMemePhrasRepository
) : MemePhraseRepository {

    @Deprecated("findRandomByLanguage로 대체 예정")
    override fun findRandom(): MemePhrase = findRandomByLanguage("ko")

    @Deprecated("findRandomByLanguageAndTags로 대체 예정")
    override fun findRandomByTags(tags: List<String>): MemePhrase? = findRandomByLanguageAndTags("ko", tags)

    override fun findRandomByLanguage(language: String): MemePhrase =
        jpaRepository.findOneRandomByLanguage(language)?.toDomain()
            ?: throw MemeSourceNotFoundException("No data in meme_phrases table. (language=$language)")

    override fun findRandomByLanguageAndTags(language: String, tags: List<String>): MemePhrase? =
        jpaRepository.findOneRandomByLanguageAndTags(language, tags.joinToString(","))?.toDomain()
}
