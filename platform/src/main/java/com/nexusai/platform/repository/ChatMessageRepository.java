package com.nexusai.platform.repository;

import com.nexusai.platform.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Belirli bir oturum ID'sine ait mesajları getir
    List<ChatMessage> findBySessionId(Long sessionId);
}