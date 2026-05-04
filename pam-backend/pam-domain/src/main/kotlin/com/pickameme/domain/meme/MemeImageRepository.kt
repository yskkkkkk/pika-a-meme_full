package com.pickameme.domain.meme

interface MemeImageRepository {
    fun findRandom(): MemeImage
    fun findRandomByTags(tags: List<String>): MemeImage?
}
