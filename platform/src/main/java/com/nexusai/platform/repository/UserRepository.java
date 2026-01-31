package com.nexusai.platform.repository;

import com.nexusai.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Hazır metodlara ek olarak, isme göre kullanıcı bulma metodunu yazıyoruz:
    // "SELECT * FROM users WHERE username = ?" sorgusunu otomatik yapar.
    Optional<User> findByUsername(String username);
}