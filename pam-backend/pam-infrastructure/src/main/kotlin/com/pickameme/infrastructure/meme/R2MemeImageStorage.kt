package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.infrastructure.config.R2Properties
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.core.sync.RequestBody
import java.time.Duration

@Component
class R2MemeImageStorage(
    private val s3Client: S3Client,
    private val s3Presigner: S3Presigner,
    private val r2Properties: R2Properties
) : MemeImageStorage {

    override fun generatePresignedGetUrl(imageKey: String, expiresInSeconds: Long): String {
        val getObjectRequest = GetObjectRequest.builder()
            .bucket(r2Properties.bucketName)
            .key(imageKey)
            .build()
        val presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofSeconds(expiresInSeconds))
            .getObjectRequest(getObjectRequest)
            .build()
        return s3Presigner.presignGetObject(presignRequest).url().toString()
    }

    override fun uploadOgImage(memeId: String, bytes: ByteArray, contentType: String): String {
        val key = "og/$memeId.png"
        val putObjectRequest = PutObjectRequest.builder()
            .bucket(r2Properties.bucketName)
            .key(key)
            .contentType(contentType)
            .build()
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes))
        return "https://img.pick-a-me.me/$key"
    }
}
