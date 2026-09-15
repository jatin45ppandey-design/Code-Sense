package jatin.backend.Service.github;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import jatin.backend.Exceptions.ExternalServiceException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GithubApiClient {

    private static final String API_BASE = "https://api.github.com";

    private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST_MAP = new ParameterizedTypeReference<>() {
    };
    private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {
    };

    private final RestClient.Builder restClientBuilder;

     public List<Map<String, Object>> listUserRepos(String accessToken) {
        List<Map<String, Object>> all = new ArrayList<>();
        int page = 1;
        while (page <= 10) {
            final int currentPage = page;
            List<Map<String, Object>> pageRepos = execute(() -> client(accessToken)
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/user/repos")
                            .queryParam("affiliation", "owner,collaborator,organization_member")
                            .queryParam("sort", "updated")
                            .queryParam("per_page", 100)
                            .queryParam("page", currentPage)
                            .build())
                    .retrieve()
                    .body(LIST_MAP));
            if (pageRepos == null || pageRepos.isEmpty()) {
                break;
            }
            all.addAll(pageRepos);
            if (pageRepos.size() < 100) {
                break;
            }
            page++;
        }
        return all;
    }

      public Map<String, Object> getRepoTree(String accessToken, String owner, String repo, String branch) {
        return execute(() -> client(accessToken)
                .get()
                .uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", owner, repo, branch)
                .retrieve()
                .body(MAP));
    }

       public String getFileContent(String accessToken, String owner, String repo, String path) {
        Map<String, Object> body = execute(() -> client(accessToken)
                .get()
                .uri("/repos/{owner}/{repo}/contents/{path}", owner, repo, path)
                .retrieve()
                .body(MAP));
        if (body == null) {
            return null;
        }
        Object encoding = body.get("encoding");
        Object content = body.get("content");
        if (content == null) {
            return null;
        }
        if ("base64".equals(String.valueOf(encoding))) {
            String raw = String.valueOf(content).replaceAll("\\s", "");
            try {
                return new String(Base64.getDecoder().decode(raw), StandardCharsets.UTF_8);
            } catch (IllegalArgumentException exception) {
                throw new ExternalServiceException(
                        HttpStatus.BAD_GATEWAY, "GitHub returned invalid file content", exception);
            }
        }
        return String.valueOf(content);
    }
    
    private RestClient client(String accessToken){
          return restClientBuilder
                .baseUrl(API_BASE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .defaultHeader(HttpHeaders.USER_AGENT, "Devguide")
                .build();
    }

    private static <T> T execute(Supplier<T> request) {
        try {
            return request.get();
        } catch (RestClientResponseException exception) {
            int status = exception.getStatusCode().value();
            if (status == 401) {
                throw providerError(HttpStatus.UNAUTHORIZED,
                        "GitHub authorization expired; sign in again", exception);
            }
            if (status == 403) {
                throw providerError(HttpStatus.FORBIDDEN,
                        "GitHub access was denied or its rate limit was exceeded", exception);
            }
            if (status == 404) {
                throw providerError(HttpStatus.NOT_FOUND,
                        "GitHub repository or branch was not found", exception);
            }
            if (status == 409) {
                throw providerError(HttpStatus.CONFLICT,
                        "GitHub repository is empty", exception);
            }
            if (status == 429) {
                throw providerError(HttpStatus.TOO_MANY_REQUESTS,
                        "GitHub API rate limit exceeded", exception);
            }
            throw providerError(HttpStatus.BAD_GATEWAY,
                    "GitHub is temporarily unavailable", exception);
        } catch (RestClientException exception) {
            throw providerError(HttpStatus.BAD_GATEWAY,
                    "GitHub could not be reached", exception);
        }
    }

    private static ExternalServiceException providerError(
            HttpStatus status, String message, RuntimeException cause) {
        return new ExternalServiceException(status, message, cause);
    }
}
