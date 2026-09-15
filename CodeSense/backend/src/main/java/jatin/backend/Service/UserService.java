package jatin.backend.Service;

import jakarta.transaction.Transactional;
import jatin.backend.Entity.User;
import jatin.backend.Exceptions.BadReqException;
import jatin.backend.Exceptions.NotFoundException;
import jatin.backend.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Contains user lookup and GitHub access-token operations.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    // Reads and writes User records in the database.
    public final UserRepo userRepo;

    // Decrypts access tokens before they are used to call GitHub.
    public final TextEncryptor tokenEncryptor;

    /**
     * Finds a user by database ID inside a transaction.
     */
    @Transactional
    public User reqById(UUID id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    /**
     * Decrypts the access token stored for a user.
     */
    public String decryptaccessToken(User user) {
        return tokenEncryptor.decrypt(user.getAccessToken());
    }

    /**
     * Converts GitHub's numeric ID value to Long and rejects missing or invalid IDs.
     */
    private static Long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }

        if (value instanceof String text) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException exception) {
                throw new BadReqException("GitHub user id is invalid", exception);
            }
        }

        throw new BadReqException("GitHub user id is missing");
    }

    /**
     * Creates a new user or updates an existing user from the GitHub OAuth2 profile.
     */
    @Transactional
    public User upsertFromGitHub(Map<String, Object> attributes, String accessToken, String scopes) {
        // Reads the profile values returned by GitHub after a successful OAuth2 login.
        Long githubId = toLong(attributes.get("id"));
        String login = requiredText(attributes, "login", "GitHub login is missing");
        String name = optionalText(attributes.get("name"), login);
        String avatarUrl = optionalText(attributes.get("avatar_url"), "");

        // Encrypts the token before it is persisted in the database.
        if (accessToken == null || accessToken.isBlank()) {
            throw new BadReqException("GitHub access token is missing");
        }
        String encryptedToken = tokenEncryptor.encrypt(accessToken);

        // Reuses the existing account when this GitHub user has logged in before.
        User user = userRepo.findByGithubId(githubId).orElseGet(User::new);

        // Refreshes profile details and OAuth credentials with the latest GitHub values.
        user.setGithubId(githubId);
        user.setGithubUsername(login);
        user.setDisplayname(name);
        user.setAvatarUrl(avatarUrl);
        user.setAccessToken(encryptedToken);
        user.setTokenscopes(scopes);

        // Inserts a new record or saves changes to the existing record.
        return userRepo.save(user);
    }

    /**
     * Returns a required GitHub profile field or reports a malformed OAuth response.
     */
    private static String requiredText(Map<String, Object> attributes, String key, String errorMessage) {
        String value = optionalText(attributes.get(key), "");
        if (value.isBlank()) {
            throw new BadReqException(errorMessage);
        }
        return value;
    }

    /**
     * Converts an optional profile value to text and applies a fallback when it is absent.
     */
    private static String optionalText(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }

        String text = String.valueOf(value).trim();
        return text.isEmpty() ? fallback : text;
    }
}
