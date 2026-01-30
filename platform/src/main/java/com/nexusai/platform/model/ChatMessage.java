package com.nexusai.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT") // Uzun mesajlar için
    private String content;

    private String role; // "user" veya "assistant"

    private LocalDateTime timestamp;

    // Hangi sohbete ait olduğunu bilmeli (Many-To-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    @JsonIgnore
    private ChatSession session;

    // --- Constructor ---
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatMessage(String content, String role, ChatSession session) {
        this.content = content;
        this.role = role;
        this.session = session;
        this.timestamp = LocalDateTime.now();
    }

    // --- Getter & Setter ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public ChatSession getSession() { return session; }
    public void setSession(ChatSession session) { this.session = session; }
}