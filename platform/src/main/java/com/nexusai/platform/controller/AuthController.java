package com.nexusai.platform.controller;

import com.nexusai.platform.model.User;
import com.nexusai.platform.repository.UserRepository;
import com.nexusai.platform.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. KAYIT OL (Register)
    // React'ten { "username": "...", "password": "..." } gelir.
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Bu kullanıcı adı zaten alınmış!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        // Şifreyi açık haliyle değil, şifrelenmiş (Hash) haliyle kaydediyoruz!
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        userRepository.save(user);

        return ResponseEntity.ok("Kullanıcı başarıyla oluşturuldu.");
    }

    // 2. GİRİŞ YAP (Login)
    // Başarılı olursa geriye TOKEN döner.
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest request) {
        try {
            // Spring Security, kullanıcı adı ve şifreyi kontrol ediyor...
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Eğer hata vermediyse giriş başarılıdır. Token üretelim:
            if (authentication.isAuthenticated()) {
                String token = jwtService.generateToken(request.getUsername());
                return ResponseEntity.ok(new AuthResponse(token));
            } else {
                throw new UsernameNotFoundException("Geçersiz kullanıcı isteği.");
            }

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Giriş Başarısız: Kullanıcı adı veya şifre yanlış.");
        }
    }
}

// --- DTO (Data Transfer Objects) ---
// Veri taşımak için kullanılan küçük kutucuklar.
// Bunları aynı dosyanın altına yazabilirsin (public class olmazlar).

class AuthRequest {
    private String username;
    private String password;

    // Getter & Setter
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class AuthResponse {
    private String token;

    public AuthResponse(String token) {
        this.token = token;
    }

    // Getter & Setter
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}