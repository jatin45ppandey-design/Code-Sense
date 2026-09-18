[1mdiff --git a/CodeSense/backend/src/main/java/jatin/backend/Config/SecurityConfig.java b/CodeSense/backend/src/main/java/jatin/backend/Config/SecurityConfig.java[m
[1mindex 70d0fd0..ac0866d 100644[m
[1m--- a/CodeSense/backend/src/main/java/jatin/backend/Config/SecurityConfig.java[m
[1m+++ b/CodeSense/backend/src/main/java/jatin/backend/Config/SecurityConfig.java[m
[36m@@ -31,195 +31,58 @@[m [mpublic class SecurityConfig {[m
             AuthenticationFailureHandler oauth2FailureHandler,[m
             OAuth2AuthorizationRequestResolver authorizationRequestResolver[m
     ) throws Exception {[m
[31m-[m
[31m-        http[m
[31m-                .cors(Customizer.withDefaults())[m
[31m-[m
[32m+[m[32m        http.cors(Customizer.withDefaults())[m
                 .csrf(csrf -> csrf.disable())[m
[31m-[m
[31m-                .sessionManagement(session -> session[m
[31m-                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)[m
[31m-                )[m
[31m-[m
[32m+[m[32m                .sessionManagement(session -> session.sessionCreationPolicy([m
[32m+[m[32m                        SessionCreationPolicy.IF_REQUIRED))[m
                 .authorizeHttpRequests(auth -> auth[m
[31m-[m
[31m-                        .requestMatchers([m
[31m-                                "/api/auth/login-url",[m
[31m-                                "/oauth2/**",[m
[31m-                                "/login/oauth2/**",[m
[31m-                                "/error"[m
[31m-                        ).permitAll()[m
[31m-[m
[31m-                        .requestMatchers(HttpMethod.OPTIONS, "/**")[m
[31m-                        .permitAll()[m
[31m-[m
[31m-                        .requestMatchers("/api/**")[m
[31m-                        .authenticated()[m
[31m-[m
[31m-                        .anyRequest()[m
[31m-                        .permitAll()[m
[31m-                )[m
[31m-[m
[31m-                .exceptionHandling(exceptions -> exceptions[m
[31m-                        .authenticationEntryPoint([m
[31m-                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)[m
[31m-                        )[m
[31m-                )[m
[31m-[m
[32m+[m[32m                        .requestMatchers("/api/auth/login-url", "/oauth2/**",[m
[32m+[m[32m                                "/login/oauth2/**", "/error").permitAll()[m
[32m+[m[32m                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()[m
[32m+[m[32m                        .requestMatchers("/api/**").authenticated()[m
[32m+[m[32m                        .anyRequest().permitAll())[m
[32m+[m[32m                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint([m
[32m+[m[32m                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))[m
                 .oauth2Login(oauth2 -> oauth2[m
[31m-[m
[31m-                        .authorizationEndpoint(endpoint -> endpoint[m
[31m-                                .authorizationRequestResolver([m
[31m-                                        authorizationRequestResolver[m
[31m-                                )[m
[31m-                        )[m
[31m-[m
[31m-                        .userInfoEndpoint(userInfo -> userInfo[m
[31m-                                .userService(githubOAuth2UserService)[m
[31m-                        )[m
[31m-[m
[32m+[m[32m                        .authorizationEndpoint(endpoint -> endpoint.authorizationRequestResolver([m
[32m+[m[32m                                authorizationRequestResolver))[m
[32m+[m[32m                        .userInfoEndpoint(userInfo -> userInfo.userService(githubOAuth2UserService))[m
                         .successHandler(oauth2SuccessHandler)[m
[31m-[m
[31m-                        .failureHandler(oauth2FailureHandler)[m
[31m-                )[m
[31m-[m
[32m+[m[32m                        .failureHandler(oauth2FailureHandler))[m
                 .logout(logout -> logout[m
[31m-[m
                         .logoutUrl("/api/auth/logout")[m
[31m-[m
[31m-                        .logoutSuccessHandler([m
[31m-                                (request, response, authentication) ->[m
[31m-                                        response.setStatus([m
[31m-                                                HttpStatus.NO_CONTENT.value()[m
[31m-                                        )[m
[31m-                        )[m
[31m-[m
[32m+[m[32m                        .logoutSuccessHandler((request, response, authentication) ->[m
[32m+[m[32m                                response.setStatus(HttpStatus.NO_CONTENT.value()))[m
                         .invalidateHttpSession(true)[m
[31m-[m
                         .clearAuthentication(true)[m
[31m-[m
[31m-                        .deleteCookies("DEVGUIDE_SESSION")[m
[31m-                );[m
[31m-[m
[32m+[m[32m                        .deleteCookies("DEVGUIDE_SESSION"));[m
         return http.build();[m
     }[m
 [m
     @Bean[m
     OAuth2AuthorizationRequestResolver authorizationRequestResolver([m
[31m-            ClientRegistrationRepository clientRegistrationRepository[m
[31m-    ) {[m
[31m-[m
[32m+[m[32m            ClientRegistrationRepository clientRegistrationRepository) {[m
         DefaultOAuth2AuthorizationRequestResolver resolver =[m
                 new DefaultOAuth2AuthorizationRequestResolver([m
[31m-                        clientRegistrationRepository,[m
[31m-                        "/oauth2/authorization"[m
[31m-                );[m
[31m-[m
[32m+[m[32m                        clientRegistrationRepository, "/oauth2/authorization");[m
         resolver.setAuthorizationRequestCustomizer(builder ->[m
                 builder.additionalParameters(parameters ->[m
[31m-                        parameters.put("prompt", "select_account")[m
[31m-                )[m
[31m-        );[m
[31m-[m
[32m+[m[32m                        parameters.put("prompt", "select_account")));[m
         return resolver;[m
     }[m
 [m
     @Bean[m
     AuthenticationSuccessHandler oauth2SuccessHandler([m
[31m-            @Value("${app.frontend-url:http://localhost:3000}")[m
[31m-            String frontendUrl[m
[31m-    ) {[m
[31m-[m
[31m-        return (request, response, authentication) -> {[m
[31m-[m
[31m-            System.out.println();[m
[31m-            System.out.println("======================================");[m
[31m-            System.out.println("GITHUB OAUTH2 LOGIN SUCCESS");[m
[31m-            System.out.println("======================================");[m
[31m-[m
[31m-            if (authentication != null) {[m
[31m-                System.out.println([m
[31m-                        "Authenticated user: " + authentication.getName()[m
[31m-                );[m
[31m-            }[m
[31m-[m
[31m-            System.out.println("Redirecting to: "[m
[31m-                    + frontendUrl[m
[31m-                    + "/auth/callback");[m
[31m-[m
[31m-            System.out.println("======================================");[m
[31m-            System.out.println();[m
[31m-[m
[31m-            response.sendRedirect([m
[31m-                    frontendUrl + "/auth/callback"[m
[31m-            );[m
[31m-        };[m
[32m+[m[32m            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {[m
[32m+[m[32m        return (request, response, authentication) ->[m
[32m+[m[32m                response.sendRedirect(frontendUrl.replaceAll("/+$", "") + "/auth/callback");[m
     }[m
 [m
     @Bean[m
     AuthenticationFailureHandler oauth2FailureHandler([m
[31m-            @Value("${app.frontend-url:http://localhost:3000}")[m
[31m-            String frontendUrl[m
[31m-    ) {[m
[31m-[m
[31m-        return (request, response, exception) -> {[m
[31m-[m
[31m-            System.err.println();[m
[31m-            System.err.println("======================================");[m
[31m-            System.err.println("GITHUB OAUTH2 LOGIN FAILED");[m
[31m-            System.err.println("======================================");[m
[31m-[m
[31m-            System.err.println("Exception type:");[m
[31m-            System.err.println([m
[31m-                    exception.getClass().getName()[m
[31m-            );[m
[31m-[m
[31m-            System.err.println();[m
[31m-[m
[31m-            System.err.println("Exception message:");[m
[31m-            System.err.println([m
[31m-                    exception.getMessage()[m
[31m-            );[m
[31m-[m
[31m-            Throwable cause = exception.getCause();[m
[31m-            int level = 1;[m
[31m-[m
[31m-            while (cause != null && level <= 10) {[m
[31m-[m
[31m-                System.err.println();[m
[31m-[m
[31m-                System.err.println([m
[31m-                        "Cause " + level + " type:"[m
[31m-                );[m
[31m-[m
[31m-                System.err.println([m
[31m-                        cause.getClass().getName()[m
[31m-                );[m
[31m-[m
[31m-                System.err.println([m
[31m-                        "Cause " + level + " message:"[m
[31m-                );[m
[31m-[m
[31m-                System.err.println([m
[31m-                        cause.getMessage()[m
[31m-                );[m
[31m-[m
[31m-                cause = cause.getCause();[m
[31m-                level++;[m
[31m-            }[m
[31m-[m
[31m-            System.err.println();[m
[31m-            System.err.println("Redirecting to:");[m
[31m-            System.err.println([m
[31m-                    frontendUrl + "/login?error=oauth2_failed"[m
[31m-            );[m
[31m-[m
[31m-            System.err.println("======================================");[m
[31m-            System.err.println();[m
[31m-[m
[31m-            response.sendRedirect([m
[31m-                    frontendUrl + "/login?error=oauth2_failed"[m
[31m-            );[m
[31m-        };[m
[32m+[m[32m            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {[m
[32m+[m[32m        return (request, response, exception) ->[m
[32m+[m[32m                response.sendRedirect(frontendUrl.replaceAll("/+$", "")[m
[32m+[m[32m                        + "/login?error=oauth2_failed");[m
     }[m
[31m-}[m
\ No newline at end of file[m
[32m+[m[32m}[m
[1mdiff --git a/CodeSense/backend/src/main/java/jatin/backend/Service/ai/ChatStreamHandler.java b/CodeSense/backend/src/main/java/jatin/backend/Service/ai/ChatStreamHandler.java[m
[1mindex 275896e..9725949 100644[m
[1m--- a/CodeSense/backend/src/main/java/jatin/backend/Service/ai/ChatStreamHandler.java[m
[1m+++ b/CodeSense/backend/src/main/java/jatin/backend/Service/ai/ChatStreamHandler.java[m
[36m@@ -3,7 +3,9 @@[m [mpackage jatin.backend.Service.ai;[m
 import java.io.IOException;[m
 import java.util.List;[m
 import java.util.UUID;[m
[32m+[m[32mimport java.util.concurrent.atomic.AtomicBoolean;[m
 [m
[32m+[m[32mimport org.springframework.http.HttpStatus;[m
 import org.springframework.http.MediaType;[m
 import org.springframework.stereotype.Component;[m
 import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;[m
[36m@@ -12,14 +14,13 @@[m [mimport jatin.backend.DTO.ChatMessageResponse;[m
 import jatin.backend.DTO.CitationDto;[m
 import jatin.backend.Entity.ChatMessage;[m
 import jatin.backend.Entity.MessageRole;[m
[32m+[m[32mimport jatin.backend.Exceptions.ExternalServiceException;[m
 import jatin.backend.Repo.ChatMessageRepository;[m
 import lombok.RequiredArgsConstructor;[m
 import lombok.extern.slf4j.Slf4j;[m
 import reactor.core.Disposable;[m
 [m
[31m-/**[m
[31m- * Generation step: stream provider-neutral chat tokens to the browser over SSE.[m
[31m- */[m
[32m+[m[32m/** Generation step: stream provider-neutral chat tokens to the browser over SSE. */[m
 @Component[m
 @RequiredArgsConstructor[m
 @Slf4j[m
[36m@@ -29,114 +30,126 @@[m [mpublic class ChatStreamHandler {[m
     private final ChatMessageRepository chatMessageRepository;[m
     private final CitationMapper citationMapper;[m
 [m
[31m-    public SseEmitter stream([m
[31m-            UUID sessionId,[m
[31m-            ChatMessageResponse savedUserMessage,[m
[31m-            List<CitationDto> citations,[m
[31m-            String systemPrompt,[m
[31m-            String userPrompt) {[m
[31m-[m
[32m+[m[32m    public SseEmitter stream(UUID sessionId, ChatMessageResponse savedUserMessage,[m
[32m+[m[32m                             List<CitationDto> citations, String systemPrompt, String userPrompt) {[m
         SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);[m
         StringBuilder fullReply = new StringBuilder();[m
[32m+[m[32m        AtomicBoolean terminated = new AtomicBoolean();[m
 [m
         try {[m
[31m-            emitter.send(SseEmitter.event()[m
[31m-                    .name("user_message")[m
[31m-                    .data(savedUserMessage));[m
[31m-[m
[32m+[m[32m            emitter.send(SseEmitter.event().name("user_message").data(savedUserMessage));[m
             Disposable subscription = chatProvider.stream(systemPrompt, userPrompt)[m
                     .doOnNext(token -> appendToken(emitter, fullReply, token))[m
[31m-                    .doOnError(err -> {[m
[31m-                        var safeError = AiProviderErrors.sanitize(err);[m
[31m-                        log.error("Chat stream failed: {} ({})",[m
[31m-                                safeError.getMessage(), err.getClass().getSimpleName());[m
[31m-                        failStream(emitter, safeError.getMessage());[m
[32m+[m[32m                    .doOnError(error -> {[m
[32m+[m[32m                        ExternalServiceException safeError = AiProviderErrors.sanitize(error);[m
[32m+[m[32m                        log.error("Chat stream failed: {} ({})", safeError.getMessage(),[m
[32m+[m[32m                                error.getClass().getSimpleName());[m
[32m+[m[32m                        failStream(emitter, safeError, terminated);[m
                     })[m
                     .doOnComplete(() -> completeStream([m
[31m-                            emitter, sessionId, fullReply, citations))[m
[32m+[m[32m                            emitter, sessionId, fullReply, citations, terminated))[m
                     .subscribe();[m
 [m
             emitter.onTimeout(() -> {[m
                 subscription.dispose();[m
[31m-                log.warn("Chat stream timed out");[m
[31m-                failStream(emitter, "AI provider request timed out");[m
[32m+[m[32m                failStream(emitter, AiProviderErrors.sanitize([m
[32m+[m[32m                        new IllegalStateException("timeout")), terminated);[m
             });[m
             emitter.onCompletion(subscription::dispose);[m
             emitter.onError(error -> subscription.dispose());[m
         } catch (IOException exception) {[m
[31m-            log.error("Could not start response stream ({})", exception.getClass().getSimpleName());[m
[31m-            failStream(emitter, "Could not start response stream");[m
[32m+[m[32m            failStream(emitter, new ExternalServiceException([m
[32m+[m[32m                    HttpStatus.BAD_GATEWAY, "Could not start response stream", exception), terminated);[m
         } catch (RuntimeException exception) {[m
[31m-            var safeError = AiProviderErrors.sanitize(exception);[m
[31m-            log.error("Could not start chat stream: {} ({})",[m
[31m-                    safeError.getMessage(), exception.getClass().getSimpleName());[m
[31m-            failStream(emitter, safeError.getMessage());[m
[32m+[m[32m            failStream(emitter, AiProviderErrors.sanitize(exception), terminated);[m
         }[m
[31m-[m
         return emitter;[m
     }[m
 [m
     private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {[m
         fullReply.append(token);[m
         try {[m
[31m-            emitter.send(SseEmitter.event()[m
[31m-                    .name("token")[m
[32m+[m[32m            emitter.send(SseEmitter.event().name("token")[m
                     .data(token, MediaType.APPLICATION_JSON));[m
[31m-        } catch (IOException ex) {[m
[31m-            throw new IllegalStateException(ex);[m
[32m+[m[32m        } catch (IOException exception) {[m
[32m+[m[32m            throw new IllegalStateException(exception);[m
         }[m
     }[m
 [m
[31m-    private void completeStream([m
[31m-            SseEmitter emitter,[m
[31m-            UUID sessionId,[m
[31m-            StringBuilder fullReply,[m
[31m-            List<CitationDto> citations) {[m
[32m+[m[32m    private void completeStream(SseEmitter emitter, UUID sessionId, StringBuilder fullReply,[m
[32m+[m[32m                                List<CitationDto> citations, AtomicBoolean terminated) {[m
[32m+[m[32m        if (fullReply.isEmpty()) {[m
[32m+[m[32m            failStream(emitter, new ExternalServiceException([m
[32m+[m[32m                    HttpStatus.BAD_GATEWAY, "AI provider returned an empty response", null), terminated);[m
[32m+[m[32m            return;[m
[32m+[m[32m        }[m
[32m+[m[32m        if (!terminated.compareAndSet(false, true)) {[m
[32m+[m[32m            return;[m
[32m+[m[32m        }[m
         try {[m
[31m-            if (fullReply.isEmpty()) {[m
[31m-                log.warn("AI provider completed a chat stream without content");[m
[31m-                failStream(emitter, "AI provider returned an empty response");[m
[31m-                return;[m
[31m-            }[m
             ChatMessage assistant = chatMessageRepository.save(ChatMessage.builder()[m
                     .sessionId(sessionId)[m
                     .role(MessageRole.ASSISTANT)[m
                     .content(fullReply.toString())[m
                     .citations(citationMapper.toJson(citations))[m
                     .build());[m
[31m-[m
[31m-            emitter.send(SseEmitter.event()[m
[31m-                    .name("assistant_message")[m
[32m+[m[32m            emitter.send(SseEmitter.event().name("assistant_message")[m
                     .data(toMessageResponse(assistant)));[m
             emitter.send(SseEmitter.event().name("done").data("[DONE]"));[m
             emitter.complete();[m
         } catch (IOException exception) {[m
[31m-            log.error("Could not complete response stream ({})", exception.getClass().getSimpleName());[m
[31m-            failStream(emitter, "Could not complete response stream");[m
[32m+[m[32m            log.error("Could not complete response stream ({})",[m
[32m+[m[32m                    exception.getClass().getSimpleName());[m
[32m+[m[32m            completeWithError(emitter, "Could not complete response stream");[m
         } catch (RuntimeException exception) {[m
             log.error("Could not persist streamed assistant response ({})",[m
                     exception.getClass().getSimpleName());[m
[31m-            failStream(emitter, "Could not persist assistant response");[m
[32m+[m[32m            completeWithError(emitter, "Could not persist assistant response");[m
         }[m
     }[m
 [m
[31m-    /** Sends failures after the response starts as an SSE event, never as a JSON error body. */[m
[31m-    private void failStream(SseEmitter emitter, String safeMessage) {[m
[32m+[m[32m    private void completeWithError(SseEmitter emitter, String message) {[m
         try {[m
[31m-            emitter.send(SseEmitter.event().name("error").data(safeMessage));[m
[31m-        } catch (IOException exception) {[m
[31m-            log.debug("Could not send SSE error event ({})", exception.getClass().getSimpleName());[m
[32m+[m[32m            emitter.send(SseEmitter.event().name("error").data(new SseError([m
[32m+[m[32m                    HttpStatus.BAD_GATEWAY.value(), "AI_PROVIDER_ERROR", message)));[m
[32m+[m[32m        } catch (IOException ignored) {[m
[32m+[m[32m            log.debug("Could not send final SSE error event");[m
[32m+[m[32m        } finally {[m
[32m+[m[32m            emitter.complete();[m
[32m+[m[32m        }[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    private void failStream(SseEmitter emitter, ExternalServiceException exception,[m
[32m+[m[32m                            AtomicBoolean terminated) {[m
[32m+[m[32m        if (!terminated.compareAndSet(false, true)) {[m
[32m+[m[32m            return;[m
[32m+[m[32m        }[m
[32m+[m[32m        try {[m
[32m+[m[32m            emitter.send(SseEmitter.event().name("error").data(new SseError([m
[32m+[m[32m                    exception.getStatus().value(), codeFor(exception.getStatus()),[m
[32m+[m[32m                    exception.getMessage())));[m
[32m+[m[32m        } catch (IOException sendException) {[m
[32m+[m[32m            log.debug("Could not send SSE error event ({})",[m
[32m+[m[32m                    sendException.getClass().getSimpleName());[m
         } finally {[m
             emitter.complete();[m
         }[m
     }[m
 [m
[32m+[m[32m    private String codeFor(HttpStatus status) {[m
[32m+[m[32m        return switch (status) {[m
[32m+[m[32m            case TOO_MANY_REQUESTS -> "AI_RATE_LIMITED";[m
[32m+[m[32m            case SERVICE_UNAVAILABLE -> "AI_TEMPORARILY_UNAVAILABLE";[m
[32m+[m[32m            case GATEWAY_TIMEOUT -> "AI_TIMEOUT";[m
[32m+[m[32m            default -> "AI_PROVIDER_ERROR";[m
[32m+[m[32m        };[m
[32m+[m[32m    }[m
[32m+[m
     private ChatMessageResponse toMessageResponse(ChatMessage message) {[m
[31m-        return new ChatMessageResponse([m
[31m-                message.getId(),[m
[31m-                message.getRole(),[m
[31m-                message.getContent(),[m
[31m-                citationMapper.fromJson(message.getCitations()),[m
[31m-                message.getCreatedAt());[m
[32m+[m[32m        return new ChatMessageResponse(message.getId(), message.getRole(), message.getContent(),[m
[32m+[m[32m                citationMapper.fromJson(message.getCitations()), message.getCreatedAt());[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    private record SseError(int status, String code, String message) {[m
     }[m
 }[m
[1mdiff --git a/CodeSense/backend/src/main/resources/application.properties b/CodeSense/backend/src/main/resources/application.properties[m
[1mindex 0876c7a..8bb4bb5 100644[m
[1m--- a/CodeSense/backend/src/main/resources/application.properties[m
[1m+++ b/CodeSense/backend/src/main/resources/application.properties[m
[36m@@ -15,6 +15,7 @@[m [mspring.config.import=optional:file:.env[.properties],optional:file:../.env[.prop[m
 # =========================[m
 spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}[m
 spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}[m
[32m+[m[32mspring.security.oauth2.client.registration.github.redirect-uri=${GITHUB_REDIRECT_URI:{baseUrl}/login/oauth2/code/{registrationId}}[m
 [m
 spring.security.oauth2.client.registration.github.scope=read:user,repo[m
 [m
