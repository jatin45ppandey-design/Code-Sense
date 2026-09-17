package jatin.backend.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Prevents authenticated API data from being stored by browsers or CDNs. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthenticatedCacheControlConfig extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (matchesApiPath(path, contextPath + "/api/auth")
                || matchesApiPath(path, contextPath + "/api/repos")
                || matchesApiPath(path, contextPath + "/api/chat")) {
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setDateHeader("Expires", 0);
        }
        filterChain.doFilter(request, response);
    }

    private boolean matchesApiPath(String path, String prefix) {
        return path.equals(prefix) || path.startsWith(prefix + "/");
    }
}
