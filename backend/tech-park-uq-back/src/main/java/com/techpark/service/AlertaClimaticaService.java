package com.techpark.service;

import com.techpark.model.Atraccion;
import com.techpark.model.Notificacion;
import com.techpark.model.Visitante;
import com.techpark.repository.AtraccionRepository;
import com.techpark.repository.NotificacionRepository;
import com.techpark.repository.VisitanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertaClimaticaService {

    @Autowired
    private AtraccionRepository atraccionRepository;

    @Autowired
    private VisitanteRepository visitanteRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Transactional
    public List<Atraccion> activarAlerta(String motivo) {
        List<Atraccion> afectadas = atraccionRepository.findByEstado(Atraccion.Estado.ACTIVA);

        for (Atraccion a : afectadas) {
            a.setEstado(Atraccion.Estado.CERRADA);
            a.setMotivoCierre("Alerta climática: " + motivo);
        }
        atraccionRepository.saveAll(afectadas);

        List<Visitante> visitantes = visitanteRepository.findAll();
        LocalDateTime ahora = LocalDateTime.now();
        String mensaje = "⚠ Alerta climática: " + motivo
                + ". Se cerraron " + afectadas.size()
                + " atracciones acuáticas y mecánicas de altura por tu seguridad.";

        List<Notificacion> notificaciones = visitantes.stream().map(v -> {
            Notificacion n = new Notificacion();
            n.setUsuarioId(v.getId());
            n.setMensaje(mensaje);
            n.setFechaCreacion(ahora);
            return n;
        }).toList();

        notificacionRepository.saveAll(notificaciones);
        return afectadas;
    }

    @Transactional
    public List<Atraccion> desactivarAlerta() {
        List<Atraccion> cerradas = atraccionRepository.findByEstadoAndMotivoCierreStartingWith(
                Atraccion.Estado.CERRADA, "Alerta climática:"
        );
        for (Atraccion a : cerradas) {
            a.setEstado(Atraccion.Estado.ACTIVA);
            a.setMotivoCierre(null);
        }
        atraccionRepository.saveAll(cerradas);
        notificacionRepository.deleteByMensajeStartingWith("⚠ Alerta climática:");
        return cerradas;
    }
}
