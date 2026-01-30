package com.nexusai.platform.service;

import com.nexusai.platform.client.AiEngineClient;
import com.nexusai.platform.dto.QuestionRequest; // <-- DEĞİŞTİ
import com.nexusai.platform.dto.AiResponse;      // <-- DEĞİŞTİ
import com.nexusai.platform.model.ChatMessage;
import com.nexusai.platform.model.ChatSession;
import com.nexusai.platform.repository.ChatMessageRepository;
import com.nexusai.platform.repository.ChatSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final AiEngineClient aiEngineClient;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    public ChatService(AiEngineClient aiEngineClient,
                       ChatSessionRepository sessionRepository,
                       ChatMessageRepository messageRepository) {
        this.aiEngineClient = aiEngineClient;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }

    public List<ChatSession> getAllSessions() {
        return sessionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ChatMessage> getSessionMessages(Long sessionId) {
        return messageRepository.findBySessionId(sessionId);
    }

    @Transactional
    public AiResponse sendMessage(Long sessionId, String question) {
        ChatSession session;

        // 1. Oturum Yönetimi
        if (sessionId == null || sessionId == 0) {
            session = new ChatSession();
            String title = question.length() > 30 ? question.substring(0, 30) + "..." : question;
            session.setTitle(title);
            session = sessionRepository.save(session);
        } else {
            session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Sohbet bulunamadı!"));
        }

        // 2. Mesajları Kaydet
        messageRepository.save(new ChatMessage(question, "user", session));

        // 3. AI'ya Sor (Senin DTO'larınla)
        AiResponse aiResponse = aiEngineClient.askPython(new QuestionRequest(question));

        // 4. Cevabı Kaydet
        messageRepository.save(new ChatMessage(aiResponse.getAnswer(), "assistant", session));

        // 5. Cevabı Dön (Session ID hilesiyle)
        return new AiResponse(aiResponse.getAnswer() + "##SESSION_ID:" + session.getId());
    }
}