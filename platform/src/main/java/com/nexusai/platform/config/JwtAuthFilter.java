package com.nexusai.platform.config;

import com.nexusai.platform.service.JwtService;
import com.nexusai.platform.service.MyUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // LOG 1: Header geldi mi?
        System.out.println("🔍 LOG 1 - İstek Geldi: " + request.getRequestURI());
        System.out.println("🔍 LOG 2 - Auth Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtService.extractUsername(token);
                System.out.println("🔍 LOG 3 - Username Okundu: " + username);
            } catch (Exception e) {
                System.out.println("🚨 LOG HATA - Token Okunamadı: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ LOG UYARI - Header eksik veya 'Bearer ' ile başlamıyor!");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Token geçerlilik kontrolü
            boolean isValid = jwtService.isTokenValid(token, userDetails);
            System.out.println("🔍 LOG 4 - Token Valid mi?: " + isValid);

            if (isValid) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("✅ LOG 5 - Giriş Başarılı, Kapı Açıldı!");
            } else {
                System.out.println("❌ LOG 5 - Token Valid Değil! (İmza veya Süre sorunu olabilir)");
            }
        }

        filterChain.doFilter(request, response);
    }
}