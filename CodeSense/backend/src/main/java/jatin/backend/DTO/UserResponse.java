package jatin.backend.DTO;

import java.util.UUID;

/**
 * Represents the safe user-profile fields returned to the frontend; it never exposes the OAuth token.
 */
public record UserResponse(UUID id, long githubId, String githubUsername,
                           String displayName, String avatarUrl) {
}
