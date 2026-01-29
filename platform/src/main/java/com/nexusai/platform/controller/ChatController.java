package com.nexusai.platform.controller;

import com.nexusai.platform.client.AiEngineClient;
import com.nexusai.platform.dto.AiResponse;
import com.nexusai.platform.dto.QuestionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin
public class ChatController {

    private final AiEngineClient aiEngineClient;
    private final ObjectMapper objectMapper;

    // Kurucumuz aynı kalıyor
    public ChatController(AiEngineClient aiEngineClient, ObjectMapper objectMapper) {
        this.aiEngineClient = aiEngineClient;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public AiResponse chat(@RequestBody QuestionRequest request) {
        System.out.println("📢 [JAVA LOG] İstek yakalandı! Gelen Soru: " + request.getQuestion());

        try {
            // ❌ ESKİ YÖNTEM (SİLİNDİ):
            // String jsonBody = objectMapper.writeValueAsString(request);

            // ✅ YENİ YÖNTEM:
            // Nesneyi direkt gönderiyoruz. Feign arka planda hallediyor.
            // Python'dan gelen cevabı String olarak alıyoruz (rawResponse).
            String rawResponse = aiEngineClient.askQuestion(request);

            // Gelen cevabı Java nesnesine çeviriyoruz
            return objectMapper.readValue(rawResponse, AiResponse.class);

        } catch (Exception e) {
            // Hata mesajını daha net görebilmek için e.toString() ekledim
            throw new RuntimeException("AI Servisi Hatası: " + e.toString());
        }
    }
}