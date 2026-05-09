package com.techpark.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class JwtCookieFactory {

    private final String cookieName;
    private final long maxAgeMs;
    private final boolean secure;
    private final String sameSite;

    public JwtCookieFactory(
            @Value("${jwt.cookie.name}") String cookieName,
            @Value("${jwt.expiration-ms}") long maxAgeMs,
            @Value("${jwt.cookie.secure}") boolean secure,
            @Value("${jwt.cookie.same-site}") String sameSite) {
        this.cookieName = cookieName;
        this.maxAgeMs = maxAgeMs;
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public String getCookieName() {
        return cookieName;
    }

    public ResponseCookie createAccessTokenCookie(String jwt) {
        return ResponseCookie.from(cookieName, jwt)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(Duration.ofMillis(maxAgeMs))
                .sameSite(sameSite)
                .build();
    }

    public ResponseCookie clearAccessTokenCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite(sameSite)
                .build();
    }
}
