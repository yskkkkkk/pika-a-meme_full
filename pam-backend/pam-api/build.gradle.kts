plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
}

dependencies {
    implementation(project(":pam-domain"))
    implementation(project(":pam-application"))
    implementation(project(":pam-infrastructure"))

    // JPA (PickAMemeApplication의 @EnableJpaRepositories 컴파일용)
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    
    // Spring Web
    implementation("org.springframework.boot:spring-boot-starter-web")

    // RedisTemplate compile-time access for RateLimitFilter
    // (pam-infrastructure declares this as 'implementation', so it is not transitively visible here)
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // Spring Security + OAuth2 Client
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")

    // .env.local 로드
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")
    
    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
}

// pam-api is the entry point, so we DO NOT disable bootJar
