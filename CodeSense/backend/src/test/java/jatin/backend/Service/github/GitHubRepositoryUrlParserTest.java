package jatin.backend.Service.github;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import jatin.backend.Exceptions.BadReqException;

class GitHubRepositoryUrlParserTest {
    private final GitHubRepositoryUrlParser parser = new GitHubRepositoryUrlParser();

    @Test
    void acceptsOnlyRepositoryRootUrlVariants() {
        assertAddress("https://github.com/facebook/react", "facebook", "react");
        assertAddress("https://github.com/facebook/react/", "facebook", "react");
        assertAddress("https://github.com/facebook/react.git", "facebook", "react");
    }

    @Test
    void rejectsNonRootAndLookalikeUrls() {
        assertInvalid("https://github.com.example.com/facebook/react");
        assertInvalid("https://github.com/facebook/react/tree/main");
        assertInvalid("https://user:pass@github.com/facebook/react");
        assertInvalid("https://github.com:443/facebook/react");
        assertInvalid("https://github.com/facebook/react?ref=main");
        assertInvalid("https://github.com");
    }

    private void assertAddress(String url, String owner, String repository) {
        GitHubRepositoryUrlParser.RepositoryAddress address = parser.parse(url);
        assertEquals(owner, address.owner());
        assertEquals(repository, address.repository());
    }

    private void assertInvalid(String url) {
        BadReqException error = assertThrows(BadReqException.class, () -> parser.parse(url));
        assertEquals("Invalid GitHub repository URL", error.getMessage());
    }
}
