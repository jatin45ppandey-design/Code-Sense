package jatin.backend.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import jatin.backend.Entity.User;
import jatin.backend.Service.UserService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GithubOAuth2UserService
        implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserService userService;

    private final DefaultOAuth2UserService delegate =
            new DefaultOAuth2UserService();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        // Load profile data from GitHub.
        OAuth2User githubUser = delegate.loadUser(userRequest);

        // OAuth access token received from GitHub.
        String accessToken =
                userRequest.getAccessToken().getTokenValue();

        // Store granted scopes for repository/API access.
        String scopes =
                userRequest.getAccessToken().getScopes().isEmpty()
                        ? "read:user,repo"
                        : String.join(
                                ",",
                                userRequest.getAccessToken().getScopes()
                        );

        // Create a new local user or update the existing GitHub user.
        User user = userService.upsertFromGitHub(
                githubUser.getAttributes(),
                accessToken,
                scopes
        );

        // This becomes the authenticated Spring Security principal.
        return new AppUserPrincipal(
                user,
                githubUser.getAttributes()
        );
    }
}