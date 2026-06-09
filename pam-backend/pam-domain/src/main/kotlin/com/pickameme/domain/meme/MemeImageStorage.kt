package com.pickameme.domain.meme

interface MemeImageStorage {
    fun generatePresignedGetUrl(imageKey: String, expiresInSeconds: Long = 3600): String
    fun uploadOgImage(memeId: String, bytes: ByteArray, contentType: String): String
}
