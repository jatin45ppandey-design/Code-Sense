package jatin.backend.Repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import jatin.backend.Entity.Repository;

public interface RepositoryRepo extends JpaRepository<Repository, UUID> {

    Optional<Repository> findByUserIdAndGithubRepoId(UUID userId, long githubRepoId);

    Optional<Repository> findByIdAndUserId(UUID id, UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select repository from Repository repository "
            + "where repository.id = :id and repository.userId = :userId")
    Optional<Repository> findForIndexing(@Param("id") UUID id, @Param("userId") UUID userId);

    List<Repository> findByUserIdOrderByFullNameAsc(UUID userId);
}
