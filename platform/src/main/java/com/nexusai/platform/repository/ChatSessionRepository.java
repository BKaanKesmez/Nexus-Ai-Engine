package com.nexusai.platform.repository;

import com.nexusai.platform.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    // Tüm sohbetleri, en yeniden en eskiye doğru sıralayıp getir
    List<ChatSession> findAllByOrderByCreatedAtDesc();
}