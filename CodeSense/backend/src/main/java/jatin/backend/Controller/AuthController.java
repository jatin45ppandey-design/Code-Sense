package jatin.backend.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jatin.backend.DTO.UserResponse;
import jatin.backend.Entity.User;
import jatin.backend.security.AppUserPrincipal;
import jatin.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CurrentUser currentUser;

    /**
     * Returns the backend OAuth URL used by the frontend
     * to start GitHub authentication.
     *
     * SecurityConfig adds prompt=select_account,
     * so GitHub shows the account picker instead of
     * silently reusing the previous account.
     */
    @GetMapping("/login-url")
    public Map<String, String> loginUrl() {
        return Map.of(
                "url",
                "/oauth2/authorization/github"
        );
    }

    /**
     * Returns the currently authenticated DevGuide user.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {

        AppUserPrincipal principal = currentUser.require();
        User user = principal.getUser();

        return ResponseEntity.ok(
                new UserResponse(
                        user.getId(),
                        user.getGithubId(),
                        user.getGithubUsername(),
                        user.getDisplayname(),
                        user.getAvatarUrl()
                )
        );
    }
}