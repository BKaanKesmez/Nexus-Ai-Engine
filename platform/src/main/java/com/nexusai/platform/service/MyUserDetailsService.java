package com.nexusai.platform.service;

import com.nexusai.platform.model.User;
import com.nexusai.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Veritabanından kullanıcıyı bul
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("Kullanıcı bulunamadı: " + username);
        }

        User user = userOptional.get();

        // 2. Spring Security'nin anlayacağı formata (UserDetails) çevirip döndür
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>() // Yetkiler/Roller (Şimdilik boş liste veriyoruz)
        );
    }
}