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

        //Hacemos los datos base para que el admin siempre exista aunque se limpie la base. :)
        int usuariosCreated = seedUsuarios();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("message", "DB cleared and base users re-seeded");
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
    if (atraccionRepository.existsById(id)) continue;

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

        Atraccion atraccion = new Atraccion(
            id,
            nombre,
            tipo,
            capacidad,
            alturaMin,
            edadMin,
            costoAdicional,
            tiempoEspera,
            estado,
            motivo
        );
        atraccion.setZonaId(String.format("Z-%02d", ((i - 1) / 4) + 1));
        atraccionRepository.save(atraccion);
        created++;
    }
        return created;
    }

    private int seedUsuarios() {
        int created = 0;

        // Admin
        created += seedAdmin("admin@techpark.com", "Juanes", "admin12345");

        // Operadores
        created += seedOperador("op1@techpark.com", "Operador 1", "op123456", "Z-01");
    created += seedOperador("op2@techpark.com", "Operador 2", "op123456", "Z-02");
    created += seedOperador("op3@techpark.com", "Operador 3", "op123456", "Z-03");
    created += seedOperador("op4@techpark.com", "Operador 4", "op123456", "Z-04");
    created += seedOperador("op5@techpark.com", "Operador 5", "op123456", "Z-05");

    // Visitantes (>=20)
    created += seedVisitantes(20);

        return created;
    }

    private int seedVisitantes(int count) {
        int created = 0;
        Random r = new Random(42);

        for (int i = 1; i <= count; i++) {
            String email = String.format("visitante%02d@techpark.com", i);
            if (usuarioRepository.existsByEmail(email)) continue;

            Visitante v = new Visitante();
            v.setEmail(email);
            v.setPassword(usuarioService.encodePasswordForStorage("visitante123"));
            v.setNombre("Visitante " + i);
            v.setDocumento("DOC" + String.format("%06d", 100000 + i));

            int edad = 10 + (i % 40); // 10..49
            double estatura = 1.1 + (r.nextInt(70) / 100.0); // 1.10..1.79
            double saldo = 0.0;

            v.setEdad(edad);
            v.setEstatura(estatura);
            v.setSaldoVirtual(saldo);
            v.setActivo(true);

            usuarioRepository.save(v);
            created++;
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
