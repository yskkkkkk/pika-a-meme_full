package com.pickameme.infrastructure.auth

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import java.util.UUID

@Component
class JwtProvider(
    @Value("\${jwt.secret}") secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long
) {
    private val key = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generate(userId: UUID): String = Jwts.builder()
        .subject(userId.toString())
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + expirationMs))
        .signWith(key)
        .compact()

    fun generateRefreshToken(userId: UUID, jti: UUID): String = Jwts.builder()
        .subject(userId.toString())
        .id(jti.toString())
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + refreshExpirationMs))
        .signWith(key)
        .compact()

    fun extractUserId(token: String): UUID =
        UUID.fromString(
            Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).payload.subject
        )

    fun extractJti(token: String): UUID =
        UUID.fromString(
            Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).payload.id
        )

    fun isValid(token: String): Boolean = runCatching {
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
        true
    }.getOrElse { e ->
        if (e is JwtException || e is IllegalArgumentException) false else throw e
    }
}
