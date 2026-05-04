package com.pickameme.infrastructure.meme

import com.pickameme.domain.exception.MemeSourceNotFoundException
import com.pickameme.domain.meme.MemePhrase
import com.pickameme.domain.meme.MemePhraseRepository
import org.springframework.stereotype.Repository

@Repository
class JpaMemePhrasRepositoryAdapter(
    private val jpaRepository: SpringDataJpaMemePhrasRepository
) : MemePhraseRepository {

    override fun findRandom(): MemePhrase =
        jpaRepository.findOneRandom()?.toDomain()
            ?: throw MemeSourceNotFoundException("meme_phrases 테이블에 데이터가 없습니다.")

    override fun findRandomByTags(tags: List<String>): MemePhrase? =
        jpaRepository.findOneRandomByTags(tags.joinToString(","))?.toDomain()
}
