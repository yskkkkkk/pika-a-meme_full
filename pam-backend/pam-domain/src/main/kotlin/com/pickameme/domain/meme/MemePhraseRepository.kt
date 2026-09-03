package com.pickameme.domain.meme

interface MemePhraseRepository {
    @Deprecated("language 인자를 받는 findRandomByLanguage로 대체 예정", ReplaceWith("findRandomByLanguage(\"ko\")"))
    fun findRandom(): MemePhrase

    @Deprecated("language 인자를 받는 findRandomByLanguageAndTags로 대체 예정", ReplaceWith("findRandomByLanguageAndTags(\"ko\", tags)"))
    fun findRandomByTags(tags: List<String>): MemePhrase?

    fun findRandomByLanguage(language: String): MemePhrase
    fun findRandomByLanguageAndTags(language: String, tags: List<String>): MemePhrase?
}
