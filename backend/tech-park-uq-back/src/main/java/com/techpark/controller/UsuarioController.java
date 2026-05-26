package com.techpark.controller;

import com.techpark.dto.LoginRequest;
import com.techpark.dto.LoginResponse;
import com.techpark.dto.OperadorRequest;
import com.techpark.dto.RegisterRequest;
import com.techpark.dto.UsuarioResponse;
import com.techpark.exception.EmailAlreadyRegisteredException;
import com.techpark.model.Usuario;
import com.techpark.security.JwtCookieFactory;
import com.techpark.security.JwtService;
import com.techpark.repository.UsuarioRepository;
import com.techpark.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import com.techpark.service.FavoritosService;
import com.techpark.service.HistorialService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtCookieFactory jwtCookieFactory;

    @Autowired
    private FavoritosService favoritosService;

    @Autowired
    private HistorialService historialService;

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

    @PostMapping("/admin")
    public ResponseEntity<?> crearAdmin(@RequestBody RegisterRequest body) {
        try {
            Usuario usuario = usuarioService.crearAdmin(body);
            return ResponseEntity.status(201)
                    .body(new LoginResponse(usuarioService.toUsuarioResponse(usuario)));
        } catch (EmailAlreadyRegisteredException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("message", "Email ya registrado"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/operador")
    public ResponseEntity<?> crearOperador(@RequestBody OperadorRequest body) {
        try {
            Usuario usuario = usuarioService.crearOperador(body);
            return ResponseEntity.status(201)
                    .body(new LoginResponse(usuarioService.toUsuarioResponse(usuario)));
        } catch (EmailAlreadyRegisteredException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("message", "Email ya registrado"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", e.getMessage()));
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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/buscar/{id}")
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

    private Long extractUserId(HttpServletRequest request) {
        String cookieName = jwtCookieFactory.getCookieName();
        if (request.getCookies() == null)
            return null;
        for (jakarta.servlet.http.Cookie c : request.getCookies()) {
            if (cookieName.equals(c.getName())) {
                String token = c.getValue();
                if (!jwtService.isValid(token))
                    return null;
                return Long.parseLong(jwtService.parseClaims(token).getSubject());
            }
        }
        return null;
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

    @GetMapping("/operadores")
    public ResponseEntity<?> getOperadores() {
        return ResponseEntity.ok(
            usuarioRepository.findAll().stream()
                .filter(u -> u instanceof com.techpark.model.Operador)
                .map(u -> {
                    com.techpark.model.Operador op = (com.techpark.model.Operador) u;
                    return java.util.Map.of(
                        "id", op.getId(),
                        "nombre", op.getNombre(),
                        "zonaAsignada", op.getZonaAsignada() != null ? op.getZonaAsignada() : ""
                    );
                })
                .toList()
        );
    }

}
