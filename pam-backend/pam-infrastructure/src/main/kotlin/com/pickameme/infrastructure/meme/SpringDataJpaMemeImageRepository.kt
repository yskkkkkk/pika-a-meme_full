package com.pickameme.infrastructure.meme

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SpringDataJpaMemeImageRepository : JpaRepository<MemeImageJpaEntity, UUID> {

    @Query(value = "SELECT * FROM meme_images ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    fun findOneRandom(): MemeImageJpaEntity?

    @Query(
        value = """
            SELECT * FROM meme_images
            WHERE EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(tags) t
                WHERE t = ANY(string_to_array(:tagsCsv, ','))
            )
            ORDER BY RANDOM() LIMIT 1
        """,
        nativeQuery = true
    )
    fun findOneRandomByTags(@Param("tagsCsv") tagsCsv: String): MemeImageJpaEntity?
}
