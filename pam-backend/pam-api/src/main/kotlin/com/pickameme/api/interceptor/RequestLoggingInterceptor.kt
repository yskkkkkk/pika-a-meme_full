package com.pickameme.api.interceptor

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class RequestLoggingInterceptor : HandlerInterceptor {

    private val log = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val START_TIME_ATTR = "REQUEST_START_TIME"
    }

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis())
        return true
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        val start = request.getAttribute(START_TIME_ATTR) as? Long ?: return
        val duration = System.currentTimeMillis() - start
        val status = response.status

        val logMessage = "${request.method} ${request.requestURI} → $status (${duration}ms)"

        when {
            ex != null     -> log.error("{} [EXCEPTION: {}]", logMessage, ex.message)
            status >= 500  -> log.error(logMessage)
            status >= 400  -> log.warn(logMessage)
            duration > 3000 -> log.warn("{} [SLOW]", logMessage)
            else           -> log.info(logMessage)
        }
    }
}
