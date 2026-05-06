package com.pickameme.domain.meme

import java.util.UUID

interface UserMemeRepository {
    fun save(userMeme: UserMeme): UserMeme
    fun findByUserId(userId: UUID, page: Int, size: Int): List<UserMeme>
}
