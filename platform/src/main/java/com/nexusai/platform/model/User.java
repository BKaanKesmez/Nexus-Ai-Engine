package com.nexusai.platform.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") // Veritabanındaki tablo adı 'users' olacak
@Data // Getter, Setter, toString metodlarını otomatik oluşturur (Lombok)
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // Kullanıcı adı benzersiz olmalı

    @Column(nullable = false)
    private String password; // Bu şifre veritabanında "hash"lenmiş (şifreli) saklanacak!

    private String role; // "USER" veya "ADMIN" gibi roller için (İleride lazım olur)
}