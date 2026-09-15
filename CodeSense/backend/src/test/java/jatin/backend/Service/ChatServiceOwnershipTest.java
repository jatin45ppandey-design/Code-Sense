package jatin.backend.Service;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jatin.backend.Entity.ChatMessage;
import jatin.backend.Entity.ChatSession;
import jatin.backend.Entity.IndexStatus;
import jatin.backend.Entity.Repository;
import jatin.backend.Exceptions.NotFoundException;
import jatin.backend.Repo.ChatMessageRepository;
import jatin.backend.Repo.ChatSessionRepository;
import jatin.backend.Service.ai.ChatPromptBuilder;
import jatin.backend.Service.ai.ChatStreamHandler;
import jatin.backend.Service.ai.CitationMapper;
import jatin.backend.Service.ai.CodeContextRetriever;
import jatin.backend.Service.ai.RetrievedContext;

@ExtendWith(MockitoExtension.class)
class ChatServiceOwnershipTest {

    @Mock ChatSessionRepository chatSessionRepository;
    @Mock ChatMessageRepository chatMessageRepository;
    @Mock RepoService repoService;
    @Mock CodeContextRetriever codeContextRetriever;
    @Mock ChatPromptBuilder chatPromptBuilder;
    @Mock ChatStreamHandler chatStreamHandler;
    @Mock CitationMapper citationMapper;

    @InjectMocks ChatService chatService;

    @Test
    void rejectsSessionThatDoesNotBelongToCurrentUser() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        when(chatSessionRepository.findByIdAndUserId(sessionId, userId))
                .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> chatService.getMessages(userId, sessionId));
    }

    @Test
    void derivesRetrievalRepositoryFromOwnedServerSideSession() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID repositoryId = UUID.randomUUID();
        ChatSession session = ChatSession.builder()
                .id(sessionId)
                .userId(userId)
                .repositoryId(repositoryId)
                .title("Chat")
                .build();
        Repository repository = new Repository();
        repository.setId(repositoryId);
        repository.setUserId(userId);
        repository.setFullName("octocat/hello-world");
        repository.setIndexStatus(IndexStatus.READY);
        SseEmitter emitter = new SseEmitter();

        when(chatSessionRepository.findByIdAndUserId(sessionId, userId))
                .thenReturn(Optional.of(session));
        when(repoService.requireOwned(repositoryId, userId)).thenReturn(repository);
        when(chatMessageRepository.save(any(ChatMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(codeContextRetriever.retrieve(repositoryId, "question"))
                .thenReturn(new RetrievedContext(List.of(), "context"));
        when(chatPromptBuilder.systemPrompt("octocat/hello-world")).thenReturn("system");
        when(chatPromptBuilder.userPrompt("context", "question")).thenReturn("user");
        when(chatStreamHandler.stream(eq(sessionId), any(), eq(List.of()), eq("system"), eq("user")))
                .thenReturn(emitter);

        assertSame(emitter, chatService.streamReply(userId, sessionId, "question"));
        verify(codeContextRetriever).retrieve(repositoryId, "question");
    }
}
