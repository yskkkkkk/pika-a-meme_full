plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
}

dependencies {
    implementation(project(":pam-application"))
    implementation(project(":pam-infrastructure"))
    
    // Spring Web
    implementation("org.springframework.boot:spring-boot-starter-web")

    // Spring Security + OAuth2 Client
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")

    // .env.local 로드
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")
    
    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

// pam-api is the entry point, so we DO NOT disable bootJar
