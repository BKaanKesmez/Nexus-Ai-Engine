package com.nexusai.platform.client;

import com.nexusai.platform.dto.QuestionRequest; // Bunu import etmeyi unutma
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ai-engine", url = "${ai.service.url}")
public interface AiEngineClient {

    // DİKKAT: Parametre tipini String'den QuestionRequest'e çevirdik.
    // Feign bunu otomatik olarak JSON'a çevirecek.
    @PostMapping(value = "/ask", consumes = "application/json")
    String askQuestion(@RequestBody QuestionRequest request);
}