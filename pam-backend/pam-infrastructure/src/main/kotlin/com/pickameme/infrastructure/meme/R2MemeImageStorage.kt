package com.pickameme.infrastructure.meme

import com.pickameme.domain.meme.MemeImageStorage
import com.pickameme.infrastructure.config.R2Properties
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import java.time.Duration

@Component
class R2MemeImageStorage(
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
}
