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
    
    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

// pam-api is the entry point, so we DO NOT disable bootJar
