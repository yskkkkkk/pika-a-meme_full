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

RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew dependencies --no-daemon -q

COPY . .
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew :pam-api:bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/pam-api/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
