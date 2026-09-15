package jatin.backend.Service.github;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;

import jatin.backend.Exceptions.ExternalServiceException;

class GithubApiClientTest {

    @Test
    void mapsEmptyRepositoryConflictToSanitizedDomainError() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(
                        "https://api.github.com/repos/octocat/empty/git/trees/main?recursive=1"))
                .andRespond(withStatus(HttpStatus.CONFLICT));

        ExternalServiceException error = assertThrows(ExternalServiceException.class,
                () -> new GithubApiClient(builder)
                        .getRepoTree("token", "octocat", "empty", "main"));

        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertEquals("GitHub repository is empty", error.getMessage());
        server.verify();
    }
}
