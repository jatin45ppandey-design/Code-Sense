package jatin.backend.Repo;


import jatin.backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepo extends JpaRepository<User, UUID> {

    // Finds a user by the unique GitHub account ID received from OAuth2.
    Optional<User> findByGithubId(long githubId);
}
