package com.pickameme.domain.meme

import java.util.UUID

interface MemeRepository {
    fun save(meme: Meme): Meme
    fun findById(id: UUID): Meme?
    fun findAllByUserId(userId: UUID, page: Int, size: Int): List<Meme>
    fun findAll(page: Int, size: Int): List<Meme>
}
