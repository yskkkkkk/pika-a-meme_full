package com.pickameme.infrastructure.heart

import com.pickameme.domain.heart.HeartHistory
import com.pickameme.domain.heart.HeartHistoryRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class JpaHeartHistoryRepositoryAdapter(
    private val springDataJpa: SpringDataJpaHeartHistoryRepository
) : HeartHistoryRepository {

    override fun save(history: HeartHistory): HeartHistory =
        springDataJpa.save(HeartHistoryJpaEntity.from(history)).toDomain()

    override fun findAllByUserId(userId: UUID): List<HeartHistory> =
        springDataJpa.findAllByUserId(userId).map { it.toDomain() }
}
