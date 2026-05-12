package com.pickameme.api.ratelimit

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

@ConfigurationProperties(prefix = "app.rate-limit")
data class RateLimitProperties(
    var enabled: Boolean = true,
    var failClosed: Boolean = true,
    var useForwardedHeaders: Boolean = false,
    var rules: List<Rule> = defaultRules()
) {
    data class Rule(
        var name: String = "",
        var path: String = "",
        var method: String? = null,
        var capacity: Long = 60,
        var window: Duration = Duration.ofMinutes(1),
        var key: Key = Key.IP
    )

    enum class Key {
        IP,
        USER_OR_IP,
        USER_AND_IP
    }

    companion object {
        fun defaultRules(): List<Rule> = listOf(
            Rule(
                name = "meme-compose",
                path = "/api/memes/compose",
                method = "GET",
                capacity = 10,
                window = Duration.ofMinutes(1),
                key = Key.USER_OR_IP
            ),
            Rule(
                name = "meme-create",
                path = "/api/memes",
                method = "POST",
                capacity = 5,
                window = Duration.ofMinutes(1),
                key = Key.USER_AND_IP
            ),
            Rule(
                name = "oauth2-start",
                path = "/oauth2/authorization/",
                method = "GET",
                capacity = 10,
                window = Duration.ofMinutes(1),
                key = Key.IP
            ),
            Rule(
                name = "oauth2-callback",
                path = "/login/oauth2/code/",
                method = "GET",
                capacity = 20,
                window = Duration.ofMinutes(1),
                key = Key.IP
            ),
            Rule(
                name = "auth-me",
                path = "/api/auth/me",
                method = "GET",
                capacity = 60,
                window = Duration.ofMinutes(1),
                key = Key.USER_AND_IP
            )
        )
    }
}
