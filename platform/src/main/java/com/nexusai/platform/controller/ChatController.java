package com.nexusai.platform.controller;

import com.nexusai.platform.dto.AiResponse;
import com.nexusai.platform.dto.QuestionRequest;
import com.nexusai.platform.model.ChatMessage;
import com.nexusai.platform.model.ChatSession;
import com.nexusai.platform.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "http://localhost:5173") // React'e izin ver
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // 1. Mesaj Gönder (Hem yeni sohbet, hem devam eden sohbet)
    // Örnek: POST /api/v1/chat?sessionId=5
    @PostMapping
    public AiResponse chat(@RequestBody QuestionRequest request,
                           @RequestParam(required = false) Long sessionId) {
        return chatService.sendMessage(sessionId, request.getQuestion());
    }

    // 2. Tüm Sohbet Başlıklarını Getir (Sidebar için)
    @GetMapping("/sessions")
    public List<ChatSession> getAllSessions() {
        return chatService.getAllSessions();
    }

    // 3. Bir Sohbetin Mesajlarını Getir (Tıklayınca yüklenmesi için)
    @GetMapping("/sessions/{sessionId}/messages")
    public List<ChatMessage> getSessionMessages(@PathVariable Long sessionId) {
        return chatService.getSessionMessages(sessionId);
    }
}