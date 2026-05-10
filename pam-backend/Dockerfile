FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY pam-backend/gradlew .
COPY pam-backend/gradle gradle
RUN chmod +x gradlew

COPY pam-backend/build.gradle.kts pam-backend/settings.gradle.kts ./
COPY pam-backend/pam-domain/build.gradle.kts pam-domain/build.gradle.kts
COPY pam-backend/pam-application/build.gradle.kts pam-application/build.gradle.kts
COPY pam-backend/pam-infrastructure/build.gradle.kts pam-infrastructure/build.gradle.kts
COPY pam-backend/pam-api/build.gradle.kts pam-api/build.gradle.kts

RUN ./gradlew dependencies --no-daemon -q

COPY pam-backend/ .
RUN ./gradlew :pam-api:bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/pam-api/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

