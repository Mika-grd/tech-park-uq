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
import com.techpark.service.FilaService;
import com.techpark.service.TicketService;
import com.techpark.service.VisitaService;

@RestController
@RequestMapping("/api/visitante")
public class VisitanteController {

    @Autowired
    private FavoritosService favoritosService;
    @Autowired
    private HistorialService historialService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private JwtCookieFactory jwtCookieFactory;
    @Autowired
    private FilaService filaService;
    @Autowired
    private TicketService ticketService;
    @Autowired
    private VisitaService visitaService;

    private Long extractUserId(HttpServletRequest request) {
        String cookieName = jwtCookieFactory.getCookieName();
        if (request.getCookies() == null)
            return null;
        for (jakarta.servlet.http.Cookie c : request.getCookies()) {
            if (cookieName.equals(c.getName())) {
                String token = c.getValue();
                if (!jwtService.isValid(token))
                    return null;
                Claims claims = jwtService.parseClaims(token);
                return Long.parseLong(claims.getSubject());
            }
        }
        return null;
    }

    @GetMapping("/favoritos")
    public ResponseEntity<?> getFavoritos(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(favoritosService.listar(userId));
    }

    @PostMapping("/favoritos/{atraccionId}")
    public ResponseEntity<?> addFavorito(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null)
            return ResponseEntity.status(401).build();
        favoritosService.agregar(userId, atraccionId);
        return ResponseEntity.ok(favoritosService.listar(userId));
    }

    @DeleteMapping("/favoritos/{atraccionId}")
    public ResponseEntity<?> removeFavorito(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null)
            return ResponseEntity.status(401).build();
        favoritosService.eliminar(userId, atraccionId);
        return ResponseEntity.ok(favoritosService.listar(userId));
    }

    @GetMapping("/historial")
    public ResponseEntity<?> getHistorial(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(historialService.listar(userId));
    }

    @PostMapping("/historial/{atraccionId}")
    public ResponseEntity<?> registrarVisita(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null)
            return ResponseEntity.status(401).build();
        historialService.registrar(userId, atraccionId);
        return ResponseEntity.ok(historialService.listar(userId));
    }

    @PostMapping("/fila/{atraccionId}")
    public ResponseEntity<?> unirseAFila(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            java.util.Map<String, Object> result = visitaService.unirseAFila(userId, atraccionId);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/fila/{atraccionId}/posicion")
    public ResponseEntity<?> getPosicion(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null)
            return ResponseEntity.status(401).build();
        int posicion = filaService.getPosicion(userId, atraccionId);
        return ResponseEntity.ok(java.util.Map.of("posicion", posicion));
    }

    @DeleteMapping("/fila/{atraccionId}")
    public ResponseEntity<?> salirDeFila(@PathVariable String atraccionId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null)
            return ResponseEntity.status(401).build();
        boolean salido = filaService.salir(userId, atraccionId);
        if (!salido)
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "No estás en la fila de esta atracción"));
        return ResponseEntity.ok(java.util.Map.of("message", "Saliste de la fila correctamente"));
    }
}
