plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    kotlin("plugin.jpa")
}

dependencies {
    implementation(project(":pam-domain"))
    
    // Spring Boot Data JPA
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    // PostgreSQL Driver
    runtimeOnly("org.postgresql:postgresql")
    // Flyway
    implementation("org.flywaydb:flyway-core")
    
    // Redis + Redisson (분산 락, Spring Data Redis 대체)
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.redisson:redisson-spring-boot-starter:3.27.2")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    // jOOQ (codegen 은 TASK-260429-06 에서 별도 설정 예정)
    implementation("org.springframework.boot:spring-boot-starter-jooq")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // Cloudflare R2 (AWS S3 SDK v2 호환)
    implementation("software.amazon.awssdk:s3:2.25.16")
}

tasks.getByName<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    enabled = false
}

tasks.getByName<Jar>("jar") {
    enabled = true
}
