package com.techpark.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final JwtCookieFactory jwtCookieFactory;

    public JwtAuthenticationFilter(JwtService jwtService, JwtCookieFactory jwtCookieFactory) {
        this.jwtService = jwtService;
        this.jwtCookieFactory = jwtCookieFactory;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String token = readTokenFromCookie(request);
        if (token == null || token.isEmpty()) {
            token = readTokenFromAuthorizationHeader(request);
        }
        if (token == null || token.isEmpty() || !jwtService.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }
        Claims claims = jwtService.parseClaims(token);
        String email = claims.get("email", String.class);
        String rol = claims.get("rol", String.class);
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var authorities = rol != null
                    ? List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                    : List.<SimpleGrantedAuthority>of();
            var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }

    private String readTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        String name = jwtCookieFactory.getCookieName();
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }

    private static String readTokenFromAuthorizationHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        return header.substring(7).trim();
    }
}
