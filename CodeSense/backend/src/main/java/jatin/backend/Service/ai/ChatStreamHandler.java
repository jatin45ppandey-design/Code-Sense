package jatin.backend.Service.ai;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jatin.backend.DTO.ChatMessageResponse;
import jatin.backend.DTO.CitationDto;
import jatin.backend.Entity.ChatMessage;
import jatin.backend.Entity.MessageRole;
import jatin.backend.Repo.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.Disposable;

/**
 * Generation step: call OpenAI via Spring AI and stream tokens to the browser over SSE.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatStreamHandler {

    private final ChatModel chatModel;
    private final ChatMessageRepository chatMessageRepository;
    private final CitationMapper citationMapper;

    public SseEmitter stream(
            UUID sessionId,
            ChatMessageResponse savedUserMessage,
            List<CitationDto> citations,
            String systemPrompt,
            String userPrompt) {

        SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);
        StringBuilder fullReply = new StringBuilder();

        try {
            emitter.send(SseEmitter.event()
                    .name("user_message")
                    .data(savedUserMessage));

            Disposable subscription = ChatClient.builder(chatModel)
                    .build()
                    .prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .stream()
                    .content()
                    .doOnNext(token -> appendToken(emitter, fullReply, token))
                    .doOnError(err -> {
                        var safeError = AiProviderErrors.sanitize(err);
                        log.error("Chat stream failed: {} ({})",
                                safeError.getMessage(), err.getClass().getSimpleName());
                        emitter.completeWithError(safeError);
                    })
                    .doOnComplete(() -> completeStream(
                            emitter, sessionId, fullReply, citations))
                    .subscribe();

            emitter.onTimeout(() -> {
                subscription.dispose();
                emitter.completeWithError(new IllegalStateException("AI response timed out"));
            });
            emitter.onCompletion(subscription::dispose);
            emitter.onError(error -> subscription.dispose());
        } catch (IOException exception) {
            emitter.completeWithError(new IllegalStateException("Could not start response stream"));
        } catch (RuntimeException exception) {
            emitter.completeWithError(AiProviderErrors.sanitize(exception));
        }

        return emitter;
    }

    private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {
        fullReply.append(token);
        try {
            emitter.send(SseEmitter.event()
                    .name("token")
                    .data(token, MediaType.APPLICATION_JSON));
        } catch (IOException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private void completeStream(
            SseEmitter emitter,
            UUID sessionId,
            StringBuilder fullReply,
            List<CitationDto> citations) {
        try {
            if (fullReply.isEmpty()) {
                emitter.completeWithError(new IllegalStateException("AI provider returned an empty response"));
                return;
            }
            ChatMessage assistant = chatMessageRepository.save(ChatMessage.builder()
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT)
                    .content(fullReply.toString())
                    .citations(citationMapper.toJson(citations))
                    .build());

            emitter.send(SseEmitter.event()
                    .name("assistant_message")
                    .data(toMessageResponse(assistant)));
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();
        } catch (IOException exception) {
            emitter.completeWithError(new IllegalStateException("Could not complete response stream"));
        } catch (RuntimeException exception) {
            log.error("Could not persist streamed assistant response ({})",
                    exception.getClass().getSimpleName());
            emitter.completeWithError(new IllegalStateException("Could not persist assistant response"));
        }
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                citationMapper.fromJson(message.getCitations()),
                message.getCreatedAt());
    }
}
