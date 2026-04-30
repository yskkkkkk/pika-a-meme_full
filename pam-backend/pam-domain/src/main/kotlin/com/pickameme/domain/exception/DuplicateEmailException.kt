package com.pickameme.domain.exception

class DuplicateEmailException(email: String) :
    DomainException("이미 사용 중인 이메일입니다. (email=$email)")
