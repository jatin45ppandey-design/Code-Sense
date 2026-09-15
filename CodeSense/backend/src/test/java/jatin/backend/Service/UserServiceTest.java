package jatin.backend.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.encrypt.TextEncryptor;

import jatin.backend.Entity.User;
import jatin.backend.Repo.UserRepo;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepo userRepo;
    @Mock TextEncryptor tokenEncryptor;
    @InjectMocks UserService userService;

    @Test
    void encryptsGithubTokenBeforePersistence() {
        when(tokenEncryptor.encrypt("plain-token")).thenReturn("encrypted-token");
        when(userRepo.findByGithubId(42L)).thenReturn(Optional.empty());
        when(userRepo.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User saved = userService.upsertFromGitHub(
                Map.of("id", 42L, "login", "octocat"),
                "plain-token",
                "repo,read:user");

        assertEquals("encrypted-token", saved.getAccessToken());
        verify(tokenEncryptor).encrypt("plain-token");
    }
}
