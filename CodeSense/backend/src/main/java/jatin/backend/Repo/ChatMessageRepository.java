package jatin.backend.Repo;



import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import jatin.backend.Entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}