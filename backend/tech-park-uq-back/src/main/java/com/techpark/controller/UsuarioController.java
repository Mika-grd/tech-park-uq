package com.techpark.controller;

import com.techpark.dto.LoginRequest;
import com.techpark.dto.LoginResponse;
import com.techpark.dto.UsuarioResponse;
import com.techpark.security.JwtCookieFactory;
import com.techpark.security.JwtService;
import com.techpark.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtCookieFactory.clearAccessTokenCookie().toString())
                .build();
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
