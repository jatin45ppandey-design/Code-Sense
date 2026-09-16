package jatin.backend.Service.github;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import jatin.backend.Exceptions.BadReqException;

/** Strictly accepts GitHub.com repository-root URLs before using the fixed API host. */
@Component
public class GitHubRepositoryUrlParser {
    private static final Pattern OWNER = Pattern.compile("[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?");
    private static final Pattern REPOSITORY = Pattern.compile("[A-Za-z0-9_.-]+?");

    public RepositoryAddress parse(String value) {
        try {
            URI uri = new URI(value == null ? "" : value.trim());
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !"github.com".equalsIgnoreCase(uri.getHost())
                    || uri.getRawAuthority() == null
                    || uri.getUserInfo() != null
                    || uri.getPort() != -1
                    || uri.getRawQuery() != null
                    || uri.getRawFragment() != null
                    || uri.getRawPath() == null) {
                throw invalid();
            }
            String[] segments = uri.getRawPath().split("/", -1);
            if (segments.length != 3 && !(segments.length == 4 && segments[3].isEmpty())) {
                throw invalid();
            }
            String owner = segments.length > 1 ? segments[1] : "";
            String repository = segments.length > 2 ? segments[2] : "";
            if (repository.endsWith(".git")) {
                repository = repository.substring(0, repository.length() - 4);
            }
            if (!OWNER.matcher(owner).matches() || !REPOSITORY.matcher(repository).matches()) {
                throw invalid();
            }
            return new RepositoryAddress(owner, repository);
        } catch (URISyntaxException exception) {
            throw invalid();
        }
    }

    private static BadReqException invalid() {
        return new BadReqException("Invalid GitHub repository URL");
    }

    public record RepositoryAddress(String owner, String repository) {
    }
}
