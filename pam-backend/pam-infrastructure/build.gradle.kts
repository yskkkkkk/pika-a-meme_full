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
    runtimeOnly("org.flywaydb:flyway-database-postgresql")
    
    // Redis + Redisson (분산 락, Spring Data Redis 대체)
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.redisson:redisson-spring-boot-starter:3.27.2")

    // jOOQ (codegen 은 TASK-260429-06 에서 별도 설정 예정)
    implementation("org.springframework.boot:spring-boot-starter-jooq")
}

tasks.getByName<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    enabled = false
}

tasks.getByName<Jar>("jar") {
    enabled = true
}
