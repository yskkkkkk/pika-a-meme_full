package com.pickameme.infrastructure.meme

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SpringDataJpaMemePhrasRepository : JpaRepository<MemePhrasJpaEntity, UUID> {

    @Query(value = "SELECT * FROM meme_phrases ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    fun findOneRandom(): MemePhrasJpaEntity?

    @Query(
        value = """
            SELECT * FROM meme_phrases
            WHERE EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(tags) t
                WHERE t = ANY(string_to_array(:tagsCsv, ','))
            )
            ORDER BY RANDOM() LIMIT 1
        """,
        nativeQuery = true
    )
    fun findOneRandomByTags(@Param("tagsCsv") tagsCsv: String): MemePhrasJpaEntity?

    @Query(value = "SELECT * FROM meme_phrases WHERE language = :language ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    fun findOneRandomByLanguage(@Param("language") language: String): MemePhrasJpaEntity?

    @Query(
        value = """
            SELECT * FROM meme_phrases
            WHERE language = :language
            AND EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(tags) t
                WHERE t = ANY(string_to_array(:tagsCsv, ','))
            )
            ORDER BY RANDOM() LIMIT 1
        """,
        nativeQuery = true
    )
    fun findOneRandomByLanguageAndTags(@Param("language") language: String, @Param("tagsCsv") tagsCsv: String): MemePhrasJpaEntity?
}
