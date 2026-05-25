package com.techpark.controller;

import com.techpark.model.Atraccion;
import com.techpark.model.Notificacion;
import com.techpark.repository.AtraccionRepository;
import com.techpark.repository.NotificacionRepository;
import com.techpark.repository.UsuarioRepository;
import com.techpark.service.AlertaClimaticaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertaClimaticaController {

    @Autowired
    private AlertaClimaticaService alertaClimaticaService;

    @Autowired
    private AtraccionRepository atraccionRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/alertas/climatica")
    public ResponseEntity<?> activarAlerta(@RequestBody Map<String, String> body) {
        String motivo = body.get("motivo");
        if (motivo == null || motivo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Motivo requerido"));
        }
        List<Atraccion> afectadas = alertaClimaticaService.activarAlerta(motivo);
        return ResponseEntity.ok(Map.of(
                "message", "Alerta climática activada",
                "atraccionesAfectadas", afectadas.size(),
                "atracciones", afectadas.stream().map(Atraccion::getNombre).toList()
        ));
    }

    @GetMapping("/alertas/climatica/activa")
    public ResponseEntity<?> getEstadoAlerta() {
        List<Atraccion> cerradas = atraccionRepository.findByEstadoAndMotivoCierreStartingWith(
                Atraccion.Estado.CERRADA, "Alerta climática:"
        );
        if (cerradas.isEmpty()) {
            return ResponseEntity.ok(Map.of("activa", false, "motivo", ""));
        }
        String motivo = cerradas.get(0).getMotivoCierre().replace("Alerta climática: ", "");
        return ResponseEntity.ok(Map.of("activa", true, "motivo", motivo, "atraccionesCerradas", cerradas.size()));
    }

    @PostMapping("/alertas/climatica/desactivar")
    public ResponseEntity<?> desactivarAlerta() {
        List<Atraccion> reabiertas = alertaClimaticaService.desactivarAlerta();
        return ResponseEntity.ok(Map.of(
                "message", "Alerta climática desactivada",
                "atraccionesReabiertas", reabiertas.size(),
                "atracciones", reabiertas.stream().map(Atraccion::getNombre).toList()
        ));
    }

    @GetMapping("/notificaciones")
    public ResponseEntity<?> getMisNotificaciones(@AuthenticationPrincipal String email) {
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
        }
        return usuarioRepository.findByEmail(email)
                .map(u -> ResponseEntity.ok(
                        notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(u.getId())
                ))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/notificaciones/{id}/leer")
    public ResponseEntity<?> marcarLeida(@PathVariable Long id, @AuthenticationPrincipal String email) {
        if (email == null) return ResponseEntity.status(401).build();
        return notificacionRepository.findById(id)
                .map(n -> {
                    n.setLeida(true);
                    notificacionRepository.save(n);
                    return ResponseEntity.ok(n);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/notificaciones/leer-todas")
    public ResponseEntity<?> marcarTodasLeidas(@AuthenticationPrincipal String email) {
        if (email == null) return ResponseEntity.status(401).build();
        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    List<Notificacion> noLeidas = notificacionRepository.findByUsuarioIdAndLeidaFalse(u.getId());
                    noLeidas.forEach(n -> n.setLeida(true));
                    notificacionRepository.saveAll(noLeidas);
                    return ResponseEntity.ok(Map.of("marcadas", noLeidas.size()));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
