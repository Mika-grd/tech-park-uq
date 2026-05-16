package com.techpark.controller;

import com.techpark.service.FavoritosService;
import com.techpark.service.HistorialService;
import com.techpark.security.JwtCookieFactory;
import com.techpark.security.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitante")
public class VisitanteController {

    @Autowired private FavoritosService favoritosService;
    @Autowired private HistorialService historialService;
    @Autowired private JwtService jwtService;
    @Autowired private JwtCookieFactory jwtCookieFactory;

    private Long extractUserId(HttpServletRequest request) {
        String cookieName = jwtCookieFactory.getCookieName();
        if (request.getCookies() == null) return null;
        for (jakarta.servlet.http.Cookie c : request.getCookies()) {
            if (cookieName.equals(c.getName())) {
                String token = c.getValue();
                if (!jwtService.isValid(token)) return null;
                Claims claims = jwtService.parseClaims(token);
                return Long.parseLong(claims.getSubject());
            }
        }
        return null;
    }

    @GetMapping("/favoritos")
    public ResponseEntity<?> getFavoritos(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(favoritosService.listar(userId));
    }

    @PostMapping("/favoritos/{atraccionId}")
    public ResponseEntity<?> addFavorito(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        favoritosService.agregar(userId, atraccionId);
        return ResponseEntity.ok(favoritosService.listar(userId));
    }

    @DeleteMapping("/favoritos/{atraccionId}")
    public ResponseEntity<?> removeFavorito(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        favoritosService.eliminar(userId, atraccionId);
        return ResponseEntity.ok(favoritosService.listar(userId));
    }

    @GetMapping("/historial")
    public ResponseEntity<?> getHistorial(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(historialService.listar(userId));
    }

    @PostMapping("/historial/{atraccionId}")
    public ResponseEntity<?> registrarVisita(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        historialService.registrar(userId, atraccionId);
        return ResponseEntity.ok(historialService.listar(userId));
    }
}
