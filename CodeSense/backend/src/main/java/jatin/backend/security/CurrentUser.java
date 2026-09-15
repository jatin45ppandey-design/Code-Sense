package jatin.backend.security;

import jatin.backend.Exceptions.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Provides the authenticated application user from Spring Security's current request context.
 */
@Component
public class CurrentUser {

    /**
     * Returns the logged-in user principal or stops the request when no user is authenticated.
     */
    public AppUserPrincipal require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new UnauthorizedException("Not authorized");
        }

        return principal;
    }
}
