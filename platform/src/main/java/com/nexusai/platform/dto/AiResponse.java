package com.nexusai.platform.dto;

import java.util.List;

public class AiResponse {
    private String answer;
    private List<String> sources;
    private String processing_time;

    // Boş Kurucu
    public AiResponse() {
    }

    // 2. Dolu Constructor (İşte eksik olan parça bu! 👇)
    public AiResponse(String answer) {
        this.answer = answer;
    }

    // Getter ve Setter'lar
    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources;
    }

    public String getProcessing_time() {
        return processing_time;
    }

    public void setProcessing_time(String processing_time) {
        this.processing_time = processing_time;
    }
}