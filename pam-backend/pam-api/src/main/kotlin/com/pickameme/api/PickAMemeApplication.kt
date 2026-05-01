package com.pickameme.api

import io.github.cdimascio.dotenv.dotenv
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["com.pickameme"])
class PickAMemeApplication

fun main(args: Array<String>) {
    // 로컬 개발 시 .env.local 자동 로드 (없으면 무시)
    dotenv {
        filename = ".env.local"
        directory = "../"        // 루트 디렉토리 기준
        ignoreIfMissing = true
    }.entries().forEach { entry ->
        if (System.getenv(entry.key) == null) {
            System.setProperty(entry.key, entry.value)
        }
    }

    runApplication<PickAMemeApplication>(*args)
}
