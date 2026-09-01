package com.pickameme.domain.exception

class DuplicateEmailException(email: String) :
    DomainException("Email already in use. (email=$email)")
