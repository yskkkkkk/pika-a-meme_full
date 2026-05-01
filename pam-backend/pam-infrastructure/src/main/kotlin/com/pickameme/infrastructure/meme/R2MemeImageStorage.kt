package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.infrastructure.config.R2Properties
import org.springframework.stereotype.Component
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import java.time.Duration

@Component
class R2MemeImageStorage(
    private val s3Client: S3Client,
    private val s3Presigner: S3Presigner,
    private val r2Properties: R2Properties
) : MemeImageStorage {

    override fun upload(imageKey: String, imageData: ByteArray, contentType: String) {
        val request = PutObjectRequest.builder()
            .bucket(r2Properties.bucketName)
            .key(imageKey)
            .contentType(contentType)
            .contentLength(imageData.size.toLong())
            .build()
        s3Client.putObject(request, RequestBody.fromBytes(imageData))
    }

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

    override fun delete(imageKey: String) {
        val request = DeleteObjectRequest.builder()
            .bucket(r2Properties.bucketName)
            .key(imageKey)
            .build()
        s3Client.deleteObject(request)
    }
}
