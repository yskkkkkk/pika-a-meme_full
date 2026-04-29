package com.pickameme.infrastructure.user

import com.pickameme.domain.user.User
import com.pickameme.domain.user.UserRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaUserRepositoryAdapter(
    private val jpaRepository: SpringDataJpaUserRepository
) : UserRepository {

    override fun save(user: User): User {
        val entity = UserJpaEntity(
            id = user.id,
            username = user.username,
            email = user.email,
            createdAt = user.createdAt,
            updatedAt = user.updatedAt
        )
        val savedEntity = jpaRepository.save(entity)
        return toDomain(savedEntity)
    }

    override fun findById(id: UUID): User? {
        return jpaRepository.findById(id).map { toDomain(it) }.orElse(null)
    }

    override fun findByEmail(email: String): User? {
        return jpaRepository.findByEmail(email)?.let { toDomain(it) }
    }

    private fun toDomain(entity: UserJpaEntity): User {
        return User(
            id = entity.id,
            username = entity.username,
            email = entity.email,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }
}
