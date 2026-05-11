package com.pickameme.api.ratelimit

import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse

class CountingFilterChain : FilterChain {
    var count: Int = 0
        private set

    override fun doFilter(request: ServletRequest, response: ServletResponse) {
        count++
    }
}
