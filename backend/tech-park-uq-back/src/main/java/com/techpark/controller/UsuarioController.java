package com.techpark.controller;

import com.techpark.dto.LoginRequest;
import com.techpark.dto.LoginResponse;
import com.techpark.dto.RegisterRequest;
import com.techpark.dto.UsuarioResponse;
import com.techpark.exception.EmailAlreadyRegisteredException;
import com.techpark.model.Usuario;
import com.techpark.security.JwtCookieFactory;
import com.techpark.security.JwtService;
import com.techpark.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtCookieFactory jwtCookieFactory;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest body) {
        return usuarioService
                .validateLogin(body)
                .map(usuario -> {
                    String token = jwtService.generateToken(usuario);
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, jwtCookieFactory.createAccessTokenCookie(token).toString())
                            .body(new LoginResponse(usuarioService.toUsuarioResponse(usuario)));
                })
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest body) {
        try {
            Usuario usuario = usuarioService.register(body);
            String token = jwtService.generateToken(usuario);
            return ResponseEntity.status(201)
                    .header(HttpHeaders.SET_COOKIE, jwtCookieFactory.createAccessTokenCookie(token).toString())
                    .body(new LoginResponse(usuarioService.toUsuarioResponse(usuario)));
        } catch (EmailAlreadyRegisteredException e) {
            return ResponseEntity.status(409).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtCookieFactory.clearAccessTokenCookie().toString())
                .build();
    }

    @PostMapping("/saldo")
    public ResponseEntity<?> adjustSaldo(@RequestBody com.techpark.dto.AdjustSaldoRequest body,
                                                       HttpServletRequest request) {
        String cookieName = jwtCookieFactory.getCookieName();
        String token = null;
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                if (cookieName.equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }
        if (token == null || !jwtService.isValid(token)) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "No autorizado"));
        }
        try {
            long userId = Long.parseLong(jwtService.parseClaims(token).getSubject());
            if (body == null || body.amount() == null || body.amount() <= 0) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Monto inválido"));
            }
            com.techpark.model.Usuario usuario = usuarioService.addSaldoToUser(userId, body.amount());
            return ResponseEntity.ok(new LoginResponse(usuarioService.toUsuarioResponse(usuario)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", "Error interno"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getById(@PathVariable Long id) {
        return usuarioService
                .findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/por-email")
    public ResponseEntity<UsuarioResponse> getByEmail(@RequestParam String email) {
        return usuarioService
                .findByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/existe-email")
    public ResponseEntity<Boolean> existsEmail(@RequestParam String email) {
        return ResponseEntity.ok(usuarioService.emailExists(email));
    }
}
