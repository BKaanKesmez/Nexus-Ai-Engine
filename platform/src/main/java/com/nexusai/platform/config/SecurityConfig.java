package com.nexusai.platform.config;

import com.nexusai.platform.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter; // Az önce yazdığımız filtre

    @Autowired
    private MyUserDetailsService userDetailsService;

    // 1. GÜVENLİK ZİNCİRİ (Filtreleme Kuralları)
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // API kullandığımız için CSRF kapalı
                .authorizeHttpRequests(auth -> auth
                        // BU ADRESLER HERKESE AÇIK OLSUN (Login ve Register)
                        .requestMatchers("/auth/**").permitAll()
                        // GERİ KALAN HER YER İÇİN GİRİŞ ŞARTI OLSUN
                        .anyRequest().authenticated()
                )
                // Oturum tutma (Stateless), çünkü her istekte Token kontrol ediyoruz.
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                // Bizim filtremizi, standart filtrenin önüne koy.
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 2. ŞİFRELEME ALGORİTMASI (BCrypt - Çok Güvenli)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 3. KİMLİK DOĞRULAMA SAĞLAYICISI
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // DEĞİŞİKLİK BURADA:
        // Parantez içi boş değil, userDetailsService'i yaratırken veriyoruz.
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);

        // PasswordEncoder'ı da muhtemelen setter ile kabul ediyordur.
        // Eğer bu satır da hata verirse, onu da constructor içine alacağız.
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    // 4. AUTH MANAGER (Controller'da Login işlemini başlatmak için lazım)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}