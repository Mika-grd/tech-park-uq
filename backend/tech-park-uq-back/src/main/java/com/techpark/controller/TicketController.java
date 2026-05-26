package com.techpark.controller;

import com.techpark.model.Ticket;
import com.techpark.model.Ticket.TipoTicket;
import com.techpark.security.JwtCookieFactory;
import com.techpark.security.JwtService;
import com.techpark.service.TicketService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired private TicketService ticketService;
    @Autowired private JwtService jwtService;
    @Autowired private JwtCookieFactory jwtCookieFactory;

    private Long extractUserId(HttpServletRequest request) {
        String cookieName = jwtCookieFactory.getCookieName();
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (cookieName.equals(c.getName())) {
                String token = c.getValue();
                if (!jwtService.isValid(token)) return null;
                Claims claims = jwtService.parseClaims(token);
                return Long.parseLong(claims.getSubject());
            }
        }
        return null;
    }

    @GetMapping("/precios")
    public ResponseEntity<Map<TipoTicket, Double>> getPrecios() {
        return ResponseEntity.ok(TicketService.PRECIOS);
    }

    @GetMapping("/recaudacion-hoy")
    public ResponseEntity<?> getRecaudacionHoy() {
        java.time.LocalDateTime inicio = java.time.LocalDate.now().atStartOfDay();
        java.time.LocalDateTime fin = inicio.plusDays(1);
        return ResponseEntity.ok(Map.of(
            "totalHoy", ticketService.getRecaudacionEntre(inicio, fin),
            "ventasHoy", ticketService.getVentasEntre(inicio, fin)
        ));
    }

    @GetMapping("/activo")
    public ResponseEntity<?> getTicketActivo(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        return ticketService.getTicketActivo(userId)
            .map(t -> ResponseEntity.ok(Map.of(
                "id", t.getId(),
                "tipo", t.getTipo(),
                "precio", t.getPrecio(),
                "fechaCompra", t.getFechaCompra().toString()
            )))
            .orElse(ResponseEntity.ok(Map.of()));
    }

    @PostMapping("/comprar")
    public ResponseEntity<?> comprar(@RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            TipoTicket tipo = TipoTicket.valueOf(body.get("tipo"));
            Ticket ticket = ticketService.comprar(userId, tipo);
            return ResponseEntity.ok(Map.of(
                "id", ticket.getId(),
                "tipo", ticket.getTipo(),
                "precio", ticket.getPrecio(),
                "fechaCompra", ticket.getFechaCompra().toString()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tipo de ticket inválido"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
