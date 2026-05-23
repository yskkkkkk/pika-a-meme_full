package com.pickameme.api.config

import com.pickameme.api.auth.CookieOAuth2AuthorizationRequestRepository
import com.pickameme.api.auth.CustomOAuth2UserService
import com.pickameme.api.auth.JwtAuthenticationFilter
import com.pickameme.api.auth.OAuth2SuccessHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import com.pickameme.api.ratelimit.RateLimitFilter
import com.pickameme.api.ratelimit.RateLimitProperties
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.config.annotation.ObjectPostProcessor
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.cors.CorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(RateLimitProperties::class)
class SecurityConfig(
    private val customOAuth2UserService: CustomOAuth2UserService,
    private val oAuth2SuccessHandler: OAuth2SuccessHandler,
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val cookieAuthorizationRequestRepository: CookieOAuth2AuthorizationRequestRepository,
    private val rateLimitFilterProvider: ObjectProvider<RateLimitFilter>,
    @Value("\${cors.allowed-origins}") private val allowedOrigins: String,
    @Value("\${oauth2.redirect-uri}") private val redirectUri: String
) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/oauth2/**", "/login/**", "/actuator/health").permitAll()
                    .requestMatchers("/api/auth/logout", "/api/auth/me", "/api/auth/refresh").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/memes/**", "/api/hearts").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .authorizationEndpoint { it.authorizationRequestRepository(cookieAuthorizationRequestRepository) }
                    .userInfoEndpoint { it.userService(customOAuth2UserService) }
                    .successHandler(oAuth2SuccessHandler)
                    .failureHandler(SimpleUrlAuthenticationFailureHandler(redirectUri))
                    .withObjectPostProcessor(object : ObjectPostProcessor<OAuth2LoginAuthenticationFilter> {
                        override fun <O : OAuth2LoginAuthenticationFilter> postProcess(filter: O): O {
                            filter.setAuthorizationRequestRepository(cookieAuthorizationRequestRepository)
                            return filter
                        }
                    })
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        rateLimitFilterProvider.ifAvailable { rateLimitFilter ->
            http.addFilterAfter(rateLimitFilter, JwtAuthenticationFilter::class.java)
        }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = allowedOrigins.split(",").map { it.trim() }
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("Content-Type", "Authorization")
        configuration.allowCredentials = true
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
