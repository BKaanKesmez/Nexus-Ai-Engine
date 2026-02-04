package com.nexusai.platform.service;

import com.nexusai.platform.client.AiEngineClient;
import com.nexusai.platform.dto.AiResponse;
import com.nexusai.platform.dto.QuestionRequest;
import com.nexusai.platform.model.ChatMessage;
import com.nexusai.platform.model.ChatSession;
import com.nexusai.platform.model.User;
import com.nexusai.platform.repository.ChatMessageRepository;
import com.nexusai.platform.repository.ChatSessionRepository;
import com.nexusai.platform.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final AiEngineClient aiEngineClient;
    private final UserRepository userRepository; // 1. User Repository eklendi

    // Constructor Injection
    public ChatService(ChatSessionRepository sessionRepository,
                       ChatMessageRepository messageRepository,
                       AiEngineClient aiEngineClient,
                       UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.aiEngineClient = aiEngineClient;
        this.userRepository = userRepository;
    }

    // ---------------------------------------------------------
    // 📨 1. MESAJ GÖNDERME FONKSİYONU (sendMessage)
    // ---------------------------------------------------------
    @Transactional
    public AiResponse sendMessage(Long sessionId, String question) {
        ChatSession session;

        // O anki giriş yapmış kullanıcıyı bul
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));

        // Yeni sohbet mi, devam eden mi?
        if (sessionId == null || sessionId == 0) {
            // --- YENİ SOHBET ---
            session = new ChatSession();
            String title = question.length() > 30 ? question.substring(0, 30) + "..." : question;
            session.setTitle(title);

            // 👇 SOHBETİN SAHİBİNİ ATIYORUZ (Artık hata vermeyecek)
            session.setUser(currentUser);

            session = sessionRepository.save(session);
        } else {
            // --- ESKİ SOHBET ---
            session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Sohbet bulunamadı!"));

            // 🛡️ GÜVENLİK: Başkasının sohbetine yazamasın
            if (!session.getUser().getUsername().equals(currentUsername)) {
                throw new RuntimeException("Bu sohbete erişim yetkiniz yok!");
            }
        }

        // Kullanıcı mesajını kaydet
        messageRepository.save(new ChatMessage(question, "user", session));

        // AI'ya sor
        AiResponse aiResponse = aiEngineClient.askPython(new QuestionRequest(question));

        // AI cevabını kaydet
        messageRepository.save(new ChatMessage(aiResponse.getAnswer(), "assistant", session));

        // Cevabı ve Session ID'yi dön
        return new AiResponse(aiResponse.getAnswer() + "##SESSION_ID:" + session.getId());
    }

    // ---------------------------------------------------------
    // 📂 2. TÜM SOHBETLERİ GETİR (getAllSessions)
    // ---------------------------------------------------------
    public List<ChatSession> getAllSessions() {
        // O anki kullanıcıyı al
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // SADECE o kullanıcının sohbetlerini getir (Hepsini değil)
        return sessionRepository.findByUser_UsernameOrderByCreatedAtDesc(currentUsername);
    }

    // ---------------------------------------------------------
    // 📜 3. BİR SOHBETİN MESAJLARINI GETİR (getSessionMessages)
    // ---------------------------------------------------------
    public List<ChatMessage> getSessionMessages(Long sessionId) {
        // Burada da güvenlik kontrolü yapılabilir ama şimdilik ID ile çekiyoruz
        return messageRepository.findBySessionId(sessionId);
    }
}