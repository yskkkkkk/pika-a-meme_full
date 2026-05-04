package com.pickameme.infrastructure.meme

import com.pickameme.domain.exception.MemeSourceNotFoundException
import com.pickameme.domain.meme.MemeImage
import com.pickameme.domain.meme.MemeImageRepository
import org.springframework.stereotype.Repository

@Repository
class JpaMemeImageRepositoryAdapter(
    private val jpaRepository: SpringDataJpaMemeImageRepository
) : MemeImageRepository {

    override fun findRandom(): MemeImage =
        jpaRepository.findOneRandom()?.toDomain()
            ?: throw MemeSourceNotFoundException("meme_images 테이블에 데이터가 없습니다.")

    override fun findRandomByTags(tags: List<String>): MemeImage? =
        jpaRepository.findOneRandomByTags(tags.joinToString(","))?.toDomain()
}
