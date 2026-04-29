package com.pickameme.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication(scanBasePackages = ["com.pickameme"])
@EnableJpaRepositories(basePackages = ["com.pickameme"])
@EntityScan(basePackages = ["com.pickameme"])
class PickAMemeApplication

fun main(args: Array<String>) {
    runApplication<PickAMemeApplication>(*args)
}
