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

        // 1. İstek başlığından (Header) Token'ı al
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // 2. Token "Bearer " ile mi başlıyor? Kontrol et.
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // "Bearer " kısmını at, sadece kodu al
            try {
                username = jwtService.extractUsername(token); // İçindeki ismi oku
            } catch (Exception e) {
                // Token bozuksa hata basma, sessizce geç (aşağıda zaten reddedilecek)
            }
        }

        // 3. Kullanıcı adı varsa ve şu an sistemde kimse oturum açmamışsa:
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 4. Token geçerli mi?
            if (jwtService.isTokenValid(token, userDetails)) {
                // Evet geçerli! Sisteme "Bu adam güvenilirdir" kartını ver.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Güvenlik bağlamına (Context) kullanıcıyı oturt.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. Zinciri devam ettir (Diğer filtrelere veya Controller'a git)
        filterChain.doFilter(request, response);
    }
}