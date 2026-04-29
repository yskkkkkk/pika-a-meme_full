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
    
    // Redis
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    
    // jOOQ (will configure codegen later as required by Phase 1, basic dependency for now)
    implementation("org.springframework.boot:spring-boot-starter-jooq")
}

tasks.getByName<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    enabled = false
}

tasks.getByName<Jar>("jar") {
    enabled = true
}
