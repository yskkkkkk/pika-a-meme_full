package com.pickameme.domain.meme

import java.util.UUID

interface UserMemeRepository {
    fun save(userMeme: UserMeme): UserMeme
    fun findByUserId(userId: UUID, page: Int, size: Int): List<UserMeme>
    fun findAllByUserId(userId: UUID, page: Int, size: Int): List<UserMeme>
    fun findByUserIdAndId(userId: UUID, id: UUID): UserMeme?
    fun findRecentTagMatched(limit: Int): List<UserMeme>
    fun updateEnabled(userId: UUID, id: UUID, enabled: Boolean)
    fun countAllByUserId(userId: UUID): Long
}
