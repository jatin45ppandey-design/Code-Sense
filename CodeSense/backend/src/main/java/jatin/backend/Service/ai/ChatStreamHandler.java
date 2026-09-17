package jatin.backend.Service.ai;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jatin.backend.DTO.ChatMessageResponse;
import jatin.backend.DTO.CitationDto;
import jatin.backend.Entity.ChatMessage;
import jatin.backend.Entity.MessageRole;
import jatin.backend.Exceptions.ExternalServiceException;
import jatin.backend.Repo.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.Disposable;

/** Generation step: stream provider-neutral chat tokens to the browser over SSE. */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatStreamHandler {

    private final ChatProvider chatProvider;
    private final ChatMessageRepository chatMessageRepository;
    private final CitationMapper citationMapper;

    public SseEmitter stream(UUID sessionId, ChatMessageResponse savedUserMessage,
                             List<CitationDto> citations, String systemPrompt, String userPrompt) {
        SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);
        StringBuilder fullReply = new StringBuilder();
        AtomicBoolean terminated = new AtomicBoolean();

        try {
            emitter.send(SseEmitter.event().name("user_message").data(savedUserMessage));
            Disposable subscription = chatProvider.stream(systemPrompt, userPrompt)
                    .doOnNext(token -> appendToken(emitter, fullReply, token))
                    .doOnError(error -> {
                        ExternalServiceException safeError = AiProviderErrors.sanitize(error);
                        log.error("Chat stream failed: {} ({})", safeError.getMessage(),
                                error.getClass().getSimpleName());
                        failStream(emitter, safeError, terminated);
                    })
                    .doOnComplete(() -> completeStream(
                            emitter, sessionId, fullReply, citations, terminated))
                    .subscribe();

            emitter.onTimeout(() -> {
                subscription.dispose();
                failStream(emitter, AiProviderErrors.sanitize(
                        new IllegalStateException("timeout")), terminated);
            });
            emitter.onCompletion(subscription::dispose);
            emitter.onError(error -> subscription.dispose());
        } catch (IOException exception) {
            failStream(emitter, new ExternalServiceException(
                    HttpStatus.BAD_GATEWAY, "Could not start response stream", exception), terminated);
        } catch (RuntimeException exception) {
            failStream(emitter, AiProviderErrors.sanitize(exception), terminated);
        }
        return emitter;
    }

    private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {
        fullReply.append(token);
        try {
            emitter.send(SseEmitter.event().name("token")
                    .data(token, MediaType.APPLICATION_JSON));
        } catch (IOException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private void completeStream(SseEmitter emitter, UUID sessionId, StringBuilder fullReply,
                                List<CitationDto> citations, AtomicBoolean terminated) {
        if (fullReply.isEmpty()) {
            failStream(emitter, new ExternalServiceException(
                    HttpStatus.BAD_GATEWAY, "AI provider returned an empty response", null), terminated);
            return;
        }
        if (!terminated.compareAndSet(false, true)) {
            return;
        }
        try {
            ChatMessage assistant = chatMessageRepository.save(ChatMessage.builder()
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT)
                    .content(fullReply.toString())
                    .citations(citationMapper.toJson(citations))
                    .build());
            emitter.send(SseEmitter.event().name("assistant_message")
                    .data(toMessageResponse(assistant)));
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();
        } catch (IOException exception) {
            log.error("Could not complete response stream ({})",
                    exception.getClass().getSimpleName());
            completeWithError(emitter, "Could not complete response stream");
        } catch (RuntimeException exception) {
            log.error("Could not persist streamed assistant response ({})",
                    exception.getClass().getSimpleName());
            completeWithError(emitter, "Could not persist assistant response");
        }
    }

    private void completeWithError(SseEmitter emitter, String message) {
        try {
            emitter.send(SseEmitter.event().name("error").data(new SseError(
                    HttpStatus.BAD_GATEWAY.value(), "AI_PROVIDER_ERROR", message)));
        } catch (IOException ignored) {
            log.debug("Could not send final SSE error event");
        } finally {
            emitter.complete();
        }
    }

    private void failStream(SseEmitter emitter, ExternalServiceException exception,
                            AtomicBoolean terminated) {
        if (!terminated.compareAndSet(false, true)) {
            return;
        }
        try {
            emitter.send(SseEmitter.event().name("error").data(new SseError(
                    exception.getStatus().value(), codeFor(exception.getStatus()),
                    exception.getMessage())));
        } catch (IOException sendException) {
            log.debug("Could not send SSE error event ({})",
                    sendException.getClass().getSimpleName());
        } finally {
            emitter.complete();
        }
    }

    private String codeFor(HttpStatus status) {
        return switch (status) {
            case TOO_MANY_REQUESTS -> "AI_RATE_LIMITED";
            case SERVICE_UNAVAILABLE -> "AI_TEMPORARILY_UNAVAILABLE";
            case GATEWAY_TIMEOUT -> "AI_TIMEOUT";
            default -> "AI_PROVIDER_ERROR";
        };
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(message.getId(), message.getRole(), message.getContent(),
                citationMapper.fromJson(message.getCitations()), message.getCreatedAt());
    }

    private record SseError(int status, String code, String message) {
    }
}
