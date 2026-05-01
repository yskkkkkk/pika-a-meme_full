package com.pickameme.domain.meme

interface MemeImageStorage {
    fun upload(imageKey: String, imageData: ByteArray, contentType: String)
    fun generatePresignedGetUrl(imageKey: String, expiresInSeconds: Long = 3600): String
    fun delete(imageKey: String)
}
