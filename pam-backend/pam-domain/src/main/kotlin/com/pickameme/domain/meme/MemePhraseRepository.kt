package com.pickameme.domain.meme

interface MemePhraseRepository {
    fun findRandom(): MemePhrase
    fun findRandomByTags(tags: List<String>): MemePhrase?
}
