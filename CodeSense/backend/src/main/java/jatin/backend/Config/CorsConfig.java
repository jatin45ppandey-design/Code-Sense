package jatin.backend.Config;

import java.util.LinkedHashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.frontend-url:http://localhost:3000}")
            String frontendUrl
    ) {

        CorsConfiguration config = new CorsConfiguration();

        // Frontend origins allowed to call the Spring backend.
        // Keep both local frontend variants available while allowing exactly
        // one configured Vercel origin. LinkedHashSet prevents duplicates when
        // FRONTEND_URL is set to either local value.
        config.setAllowedOrigins(List.copyOf(new LinkedHashSet<>(List.of(
                frontendUrl,
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        ))));

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of(
                        "Content-Type",
                        "Authorization",
                        "X-Requested-With",
                        "Accept"
                )
        );

        // Required because authentication uses DEVGUIDE_SESSION cookie.
        config.setAllowCredentials(true);

        // Browser can cache the preflight response for one hour.
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
