package com.nexusai.platform.dto;

public class QuestionRequest {
    private String question;

    // Boş Kurucu (Zorunlu)
    public QuestionRequest() {
    }

    // Dolu Kurucu
    public QuestionRequest(String question) {
        this.question = question;
    }

    // Getter (Jackson veriyi okumak için bunu kullanır)
    public String getQuestion() {
        return question;
    }

    // Setter
    public void setQuestion(String question) {
        this.question = question;
    }
}