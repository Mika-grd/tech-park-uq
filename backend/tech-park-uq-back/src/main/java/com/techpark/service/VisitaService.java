
package com.techpark.service;

import com.techpark.model.Atraccion;
import com.techpark.model.Ticket;
import com.techpark.model.Visitante;
import com.techpark.repository.AtraccionRepository;
import com.techpark.repository.UsuarioRepository;
import com.techpark.repository.VisitanteRepository;
import com.techpark.repository.ZonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class VisitaService {

    @Autowired
    private AtraccionRepository atraccionRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private VisitanteRepository visitanteRepository;
    @Autowired
    private TicketService ticketService;
    @Autowired
    private FilaService filaService;
    @Autowired
    private ZonaRepository zonaRepository;

    @Transactional
    public Map<String, Object> unirseAFila(Long userId, String atraccionId) {
        Optional<Ticket> ticketOpt = ticketService.getTicketActivo(userId);
        if (ticketOpt.isEmpty()) {
            throw new IllegalStateException("No tienes un ticket activo");
        }

        Atraccion atraccion = atraccionRepository.findById(atraccionId)
                .orElseThrow(() -> new IllegalArgumentException("Atracción no encontrada"));

        if (atraccion.getEstado() != Atraccion.Estado.ACTIVA) {
            throw new IllegalStateException("La atracción no está activa");
        }

        Visitante visitante = visitanteRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("Usuario no válido"));

        if (visitante.getEdad() < atraccion.getEdadMinima()) {
            throw new IllegalStateException("No cumples la edad mínima requerida");
        }
        if (visitante.getEstatura() < atraccion.getAlturaMinima()) {
            throw new IllegalStateException("No cumples la estatura mínima requerida");
        }
        if (atraccion.getCostoAdicional() > 0 && visitante.getSaldoVirtual() < atraccion.getCostoAdicional()) {
            throw new IllegalStateException("Saldo insuficiente para esta atracción");
        }

        if (atraccion.getCostoAdicional() > 0) {
            visitante.setSaldoVirtual(visitante.getSaldoVirtual() - atraccion.getCostoAdicional());
            usuarioRepository.save(visitante);
        }

        atraccion.setVisitantesAcumulados(atraccion.getVisitantesAcumulados() + 1);
        atraccion.setTiempoEspera(atraccion.getTiempoEspera() + 2);
        if (atraccion.getVisitantesAcumulados() >= 500) {
            atraccion.setEstado(Atraccion.Estado.EN_MANTENIMIENTO);
            atraccion.setMotivoCierre("Mantenimiento preventivo automático (500 visitantes)");
        }
        atraccionRepository.save(atraccion);

        if (atraccion.getZonaId() != null) {
            zonaRepository.findById(atraccion.getZonaId()).ifPresent(zona -> {
                zona.setVisitantesActuales(zona.getVisitantesActuales() + 1);
                zonaRepository.save(zona);
            });
        }

        filaService.unirse(userId, atraccionId, ticketOpt.get().getTipo());
        int posicion = filaService.getPosicion(userId, atraccionId);
        return Map.of("posicion", posicion);
    }
}
