package com.nexusai.platform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_sessions")
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private LocalDateTime createdAt = LocalDateTime.now();

    // 👇 EKSİK OLAN KISIM BURASIYDI: User İlişkisi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // Veritabanındaki sütun adı
    @JsonIgnore // Sonsuz döngüye girmemesi için (User -> Session -> User...)
    private User user;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<ChatMessage> messages;

    // --- GETTER & SETTER METODLARI ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ChatMessage> getMessages() { return messages; }
    public void setMessages(List<ChatMessage> messages) { this.messages = messages; }

    // 👇 BUNLARI EKLEMEZSEN 'Cannot resolve method' HATASI ALIRSIN
    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }
}