package jatin.backend.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import jatin.backend.security.GithubOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            GithubOAuth2UserService githubOAuth2UserService,
            AuthenticationSuccessHandler oauth2SuccessHandler,
            AuthenticationFailureHandler oauth2FailureHandler,
            OAuth2AuthorizationRequestResolver authorizationRequestResolver
    ) throws Exception {

        http
                .cors(Customizer.withDefaults())

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/auth/login-url",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/error"
                        ).permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        .requestMatchers("/api/**")
                        .authenticated()

                        .anyRequest()
                        .permitAll()
                )

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                        )
                )

                .oauth2Login(oauth2 -> oauth2

                        .authorizationEndpoint(endpoint -> endpoint
                                .authorizationRequestResolver(
                                        authorizationRequestResolver
                                )
                        )

                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(githubOAuth2UserService)
                        )

                        .successHandler(oauth2SuccessHandler)

                        .failureHandler(oauth2FailureHandler)
                )

                .logout(logout -> logout

                        .logoutUrl("/api/auth/logout")

                        .logoutSuccessHandler(
                                (request, response, authentication) ->
                                        response.setStatus(
                                                HttpStatus.NO_CONTENT.value()
                                        )
                        )

                        .invalidateHttpSession(true)

                        .clearAuthentication(true)

                        .deleteCookies("DEVGUIDE_SESSION")
                );

        return http.build();
    }

    @Bean
    OAuth2AuthorizationRequestResolver authorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository
    ) {

        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository,
                        "/oauth2/authorization"
                );

        resolver.setAuthorizationRequestCustomizer(builder ->
                builder.additionalParameters(parameters ->
                        parameters.put("prompt", "select_account")
                )
        );

        return resolver;
    }

    @Bean
    AuthenticationSuccessHandler oauth2SuccessHandler(
            @Value("${app.frontend-url:http://localhost:3000}")
            String frontendUrl
    ) {

        return (request, response, authentication) -> {

            System.out.println();
            System.out.println("======================================");
            System.out.println("GITHUB OAUTH2 LOGIN SUCCESS");
            System.out.println("======================================");

            if (authentication != null) {
                System.out.println(
                        "Authenticated user: " + authentication.getName()
                );
            }

            System.out.println("Redirecting to: "
                    + frontendUrl
                    + "/auth/callback");

            System.out.println("======================================");
            System.out.println();

            response.sendRedirect(
                    frontendUrl + "/auth/callback"
            );
        };
    }

    @Bean
    AuthenticationFailureHandler oauth2FailureHandler(
            @Value("${app.frontend-url:http://localhost:3000}")
            String frontendUrl
    ) {

        return (request, response, exception) -> {

            System.err.println();
            System.err.println("======================================");
            System.err.println("GITHUB OAUTH2 LOGIN FAILED");
            System.err.println("======================================");

            System.err.println("Exception type:");
            System.err.println(
                    exception.getClass().getName()
            );

            System.err.println();

            System.err.println("Exception message:");
            System.err.println(
                    exception.getMessage()
            );

            Throwable cause = exception.getCause();
            int level = 1;

            while (cause != null && level <= 10) {

                System.err.println();

                System.err.println(
                        "Cause " + level + " type:"
                );

                System.err.println(
                        cause.getClass().getName()
                );

                System.err.println(
                        "Cause " + level + " message:"
                );

                System.err.println(
                        cause.getMessage()
                );

                cause = cause.getCause();
                level++;
            }

            System.err.println();
            System.err.println("Redirecting to:");
            System.err.println(
                    frontendUrl + "/login?error=oauth2_failed"
            );

            System.err.println("======================================");
            System.err.println();

            response.sendRedirect(
                    frontendUrl + "/login?error=oauth2_failed"
            );
        };
    }
}