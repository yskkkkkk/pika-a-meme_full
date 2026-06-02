FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
RUN chmod +x gradlew

COPY build.gradle.kts settings.gradle.kts ./
COPY pam-domain/build.gradle.kts pam-domain/build.gradle.kts
COPY pam-application/build.gradle.kts pam-application/build.gradle.kts
COPY pam-infrastructure/build.gradle.kts pam-infrastructure/build.gradle.kts
COPY pam-api/build.gradle.kts pam-api/build.gradle.kts

COPY . .
RUN ./gradlew :pam-api:bootJar --no-daemon -x test && \
    rm -rf /root/.gradle

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/pam-api/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
