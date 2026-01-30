package com.nexusai.platform.client;

import com.nexusai.platform.dto.QuestionRequest; // <-- SENİN SINIFIN
import com.nexusai.platform.dto.AiResponse;      // <-- SENİN SINIFIN
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AiEngineClient {

    private final RestTemplate restTemplate;

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    public AiEngineClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AiResponse askPython(QuestionRequest request) {
        // Python'a senin DTO'larınla istek atıyoruz
        return restTemplate.postForObject(pythonServiceUrl, request, AiResponse.class);
    }
}