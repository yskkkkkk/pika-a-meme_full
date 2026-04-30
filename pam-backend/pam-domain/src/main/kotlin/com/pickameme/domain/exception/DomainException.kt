package com.pickameme.domain.exception

sealed class DomainException(message: String) : RuntimeException(message)
