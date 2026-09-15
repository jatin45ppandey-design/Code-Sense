package jatin.backend.security;

import jatin.backend.Entity.User;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class AppUserPrincipalTest {

    @Test
    void retainsOptionalNullFieldsReturnedByGitHub() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", 42L);
        attributes.put("login", "octocat");
        attributes.put("email", null);

        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).githubId(42L).build();
        AppUserPrincipal principal = new AppUserPrincipal(user, attributes);

        assertEquals(userId.toString(), principal.getName());
        assertNull(principal.getAttributes().get("email"));
    }
}
