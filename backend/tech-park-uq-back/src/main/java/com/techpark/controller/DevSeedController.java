package com.techpark.controller;

import com.techpark.model.Administrador;
import com.techpark.model.Atraccion;
import com.techpark.model.Operador;
import com.techpark.model.Visitante;
import com.techpark.model.Zona;
import com.techpark.repository.AtraccionRepository;
import com.techpark.repository.NotificacionRepository;
import com.techpark.repository.TicketRepository;
import com.techpark.repository.UsuarioRepository;
import com.techpark.repository.ZonaRepository;
import com.techpark.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/dev")
@SuppressWarnings({"NullableProblems", "DataFlowIssue"})
public class DevSeedController {

    private final AtraccionRepository atraccionRepository;
    private final ZonaRepository zonaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TicketRepository ticketRepository;
    private final NotificacionRepository notificacionRepository;
    private final UsuarioService usuarioService;

    public DevSeedController(
            AtraccionRepository atraccionRepository,
            ZonaRepository zonaRepository,
            UsuarioRepository usuarioRepository,
            TicketRepository ticketRepository,
            NotificacionRepository notificacionRepository,
            UsuarioService usuarioService
    ) {
        this.atraccionRepository = atraccionRepository;
        this.zonaRepository = zonaRepository;
        this.usuarioRepository = usuarioRepository;
        this.ticketRepository = ticketRepository;
        this.notificacionRepository = notificacionRepository;
        this.usuarioService = usuarioService;
    }

    /**
     * Carga datos demo en H2 para desarrollo.
     *
     * - Si ya existen entidades con los mismos IDs/emails, se omiten.
     */
    @PostMapping("/seed")
    @Transactional
    public ResponseEntity<Map<String, Object>> seed() {
        int zonasCreated = seedZonas();
        int atraccionesCreated = seedAtracciones();
        int usuariosCreated = seedUsuarios();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("zonasCreated", zonasCreated);
        out.put("atraccionesCreated", atraccionesCreated);
        out.put("usuariosCreated", usuariosCreated);
        out.put("zonaCount", zonaRepository.count());
        out.put("atraccionCount", atraccionRepository.count());
        out.put("usuarioCount", usuarioRepository.count());
        return ResponseEntity.ok(out);
    }

    /**
     * Limpia tablas principales (solo para desarrollo).
     *
     * Nota: borra TODO. Úsalo con cuidado.
     */
    @PostMapping("/clear")
    @Transactional
    public ResponseEntity<Map<String, Object>> clearDb() {
        notificacionRepository.deleteAll();
        ticketRepository.deleteAll();
        atraccionRepository.deleteAll();
        zonaRepository.deleteAll();
        usuarioRepository.deleteAll();

        int usuariosCreated = seedAdmin("admin@techpark.com", "Admin", "admin12345");

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("message", "DB cleared — admin re-creado");
        out.put("usuariosCreated", usuariosCreated);
        out.put("zonaCount", zonaRepository.count());
        out.put("atraccionCount", atraccionRepository.count());
        out.put("usuarioCount", usuarioRepository.count());
        return ResponseEntity.ok(out);
    }

    private int seedZonas() {
        int created = 0;
    for (int i = 1; i <= 5; i++) {
            String id = String.format("Z-%02d", i);
            if (zonaRepository.existsById(id)) continue;
            String nombre;
            if (i % 3 == 1) nombre = "Zona Mecánica " + i;
            else if (i % 3 == 2) nombre = "Zona Acuática " + i;
            else nombre = "Zona Infantil " + i;
            int capacidad = 150 + (i * 10);
            zonaRepository.save(new Zona(id, nombre, capacidad));
            created++;
        }
        return created;
    }

    private int seedAtracciones() {
        int created = 0;
        for (int i = 1; i <= 20; i++) {
            String id = String.format("A-%02d", i);
            String zonaId = String.format("Z-%02d", ((i - 1) / 4) + 1);

            if (atraccionRepository.existsById(id)) {
                atraccionRepository.findById(id).ifPresent(existing -> {
                    if (existing.getZonaId() == null || existing.getZonaId().isBlank()) {
                        existing.setZonaId(zonaId);
                        atraccionRepository.save(existing);
                    }
                });
                continue;
            }

            Atraccion.Tipo tipo = (i % 3 == 0)
                ? Atraccion.Tipo.ACUATICA
                : (i % 3 == 1 ? Atraccion.Tipo.MECANICA_ALTURA : Atraccion.Tipo.OTRO);

            Atraccion.Estado estado;
            if (i % 10 == 0) estado = Atraccion.Estado.CERRADA;
            else if (i % 7 == 0) estado = Atraccion.Estado.EN_MANTENIMIENTO;
            else estado = Atraccion.Estado.ACTIVA;

            String nombre = switch (tipo) {
                case ACUATICA -> "Aqua Splash " + i;
                case MECANICA_ALTURA -> "Sky Force " + i;
                default -> "Aventura " + i;
            };

            int capacidad = 12 + (i % 15);
            double alturaMin = tipo == Atraccion.Tipo.MECANICA_ALTURA ? 1.3 : 0.9;
            int edadMin = tipo == Atraccion.Tipo.OTRO ? 8 : 10;
            double costoAdicional = 2000 + (i * 150);
            int tiempoEspera = 5 + (i % 30);
            String motivo = estado == Atraccion.Estado.CERRADA ? "Temporal" : (estado == Atraccion.Estado.EN_MANTENIMIENTO ? "Mantenimiento" : null);

            Atraccion atraccion = new Atraccion(id, nombre, tipo, capacidad, alturaMin, edadMin, costoAdicional, tiempoEspera, estado, motivo);
            atraccion.setZonaId(zonaId);
            atraccionRepository.save(atraccion);
            created++;
        }
        return created;
    }

    private int seedUsuarios() {
        int created = 0;

        // Admin
    created += seedAdmin("admin@techpark.com", "Admin", "admin12345");

        // Operadores
    // Mínimo 2 por zona (para 5 zonas)
    created += seedOperador("op-z01-1@techpark.com", "Operador Z01-1", "op123456", "Z-01");
    created += seedOperador("op-z01-2@techpark.com", "Operador Z01-2", "op123456", "Z-01");

    created += seedOperador("op-z02-1@techpark.com", "Operador Z02-1", "op123456", "Z-02");
    created += seedOperador("op-z02-2@techpark.com", "Operador Z02-2", "op123456", "Z-02");

    created += seedOperador("op-z03-1@techpark.com", "Operador Z03-1", "op123456", "Z-03");
    created += seedOperador("op-z03-2@techpark.com", "Operador Z03-2", "op123456", "Z-03");

    created += seedOperador("op-z04-1@techpark.com", "Operador Z04-1", "op123456", "Z-04");
    created += seedOperador("op-z04-2@techpark.com", "Operador Z04-2", "op123456", "Z-04");

    created += seedOperador("op-z05-1@techpark.com", "Operador Z05-1", "op123456", "Z-05");
    created += seedOperador("op-z05-2@techpark.com", "Operador Z05-2", "op123456", "Z-05");

    // Visitantes (500)
    created += seedVisitantes(500);

        return created;
    }

    private int seedVisitantes(int count) {
        // Crear en batch para que sea rápido.
        // Nota: Visitante no tiene relación persistida a Atracción; lo “realista” lo reflejamos
        // incrementando visitantesAcumulados en atracciones por zona.
        Random r = new Random(42);

        List<Atraccion> atrs = atraccionRepository.findAll();
        // Para reflejar visitantes en zonas (persistido en `Zona.visitantesActuales`).
        Map<String, Zona> zonasById = new java.util.HashMap<>();
        for (Zona z : zonaRepository.findAll()) {
            // Reiniciamos y recalculamos en este seed (más consistente en dev)
            z.setVisitantesActuales(0);
            zonasById.put(z.getId(), z);
        }
        if (atrs.isEmpty()) {
            // Si no hay atracciones aún, igual creamos visitantes.
            atrs = List.of();
        }

        int created = 0;
        // Guardamos en lotes para evitar 500 inserts individuales.
        final int batchSize = 100;
        List<Visitante> batch = new java.util.ArrayList<>(batchSize);

        for (int i = 1; i <= count; i++) {
            String email = String.format("visitante%03d@techpark.com", i);
            if (usuarioRepository.existsByEmail(email)) continue;

            Visitante v = new Visitante();
            v.setEmail(email);
            v.setPassword(usuarioService.encodePasswordForStorage("visitante123"));

            String[] nombres = {"Sofia", "Mateo", "Valentina", "Sebastian", "Camila", "Daniel", "Isabella", "Juan", "Sara", "Nicolas"};
            String[] apellidos = {"Gomez", "Rodriguez", "Martinez", "Perez", "Garcia", "Lopez", "Hernandez", "Diaz", "Sanchez", "Torres"};
            String nombre = nombres[(i - 1) % nombres.length] + " " + apellidos[(i - 1) % apellidos.length];
            v.setNombre(nombre);

            v.setDocumento("DOC" + String.format("%06d", 100000 + i));

            int edad = 10 + (i % 40); // 10..49
            double estatura = 1.1 + (r.nextInt(70) / 100.0); // 1.10..1.79

            v.setEdad(edad);
            v.setEstatura(estatura);
            v.setSaldoVirtual(0.0);
            v.setActivo(true);

            batch.add(v);
            created++;

            // Asignación “realista”: sumamos contadores a una atracción de la misma zona
            // elegida de forma determinística.
            if (!atrs.isEmpty()) {
                Atraccion chosen = atrs.get((i - 1) % atrs.size());
                chosen.setVisitantesAcumulados(chosen.getVisitantesAcumulados() + 1);

                String zid = chosen.getZonaId();
                if (zid != null) {
                    Zona z = zonasById.get(zid);
                    if (z != null) {
                        z.setVisitantesActuales(z.getVisitantesActuales() + 1);
                    }
                }
            }

            if (batch.size() >= batchSize) {
                usuarioRepository.saveAll(batch);
                batch.clear();
            }
        }

        if (!batch.isEmpty()) {
            usuarioRepository.saveAll(batch);
        }

        // Persistimos cambios en acumulados (si hubo atracciones)
        if (!atrs.isEmpty()) {
            atraccionRepository.saveAll(atrs);
        }

        // Persistimos visitantesActuales por zona
        if (!zonasById.isEmpty()) {
            zonaRepository.saveAll(new java.util.ArrayList<>(zonasById.values()));
        }

        return created;
    }

    private int seedAdmin(String email, String nombre, String rawPassword) {
        return usuarioRepository.findByEmail(email)
                .map(existing -> {
                    existing.setNombre(nombre);
                    usuarioRepository.save(existing);
                    return 0;
                })
                .orElseGet(() -> {
                    Administrador a = new Administrador();
                    a.setEmail(email);
                    a.setNombre(nombre);
                    a.setPassword(usuarioService.encodePasswordForStorage(rawPassword));
                    a.setActivo(true);
                    usuarioRepository.save(a);
                    return 1;
                });
    }

    private int seedOperador(String email, String nombre, String rawPassword, String zonaAsignada) {
        if (usuarioRepository.existsByEmail(email)) return 0;
        Operador op = new Operador();
        op.setEmail(email);
        op.setNombre(nombre);
        op.setZonaAsignada(zonaAsignada);
        op.setPassword(usuarioService.encodePasswordForStorage(rawPassword));
        op.setActivo(true);
        usuarioRepository.save(op);
        return 1;
    }
}
