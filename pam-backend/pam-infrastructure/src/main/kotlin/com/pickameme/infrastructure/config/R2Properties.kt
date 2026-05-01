package com.pickameme.infrastructure.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "cloudflare.r2")
data class R2Properties(
    val endpoint: String,
    val accessKeyId: String,
    val secretAccessKey: String,
    val bucketName: String
)
