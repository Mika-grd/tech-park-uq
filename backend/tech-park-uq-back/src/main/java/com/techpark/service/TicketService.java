package com.techpark.service;

import com.techpark.model.Ticket;
import com.techpark.model.Ticket.TipoTicket;
import com.techpark.model.Usuario;
import com.techpark.model.Visitante;
import com.techpark.repository.TicketRepository;
import com.techpark.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class TicketService {

    public static final Map<TipoTicket, Double> PRECIOS = Map.of(
        TipoTicket.GENERAL,   50000.0,
        TipoTicket.FAMILIAR,  35000.0,
        TipoTicket.FAST_PASS, 80000.0
    );

    @Autowired private TicketRepository ticketRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    public Optional<Ticket> getTicketActivo(Long userId) {
        return ticketRepository.findByUsuarioIdAndActivoTrue(userId);
    }

    public double getRecaudacionEntre(java.time.LocalDateTime inicio, java.time.LocalDateTime fin) {
        return ticketRepository.sumRecaudacion(inicio, fin);
    }

    public long getVentasEntre(java.time.LocalDateTime inicio, java.time.LocalDateTime fin) {
        return ticketRepository.countVentas(inicio, fin);
    }

    @Transactional
    public Ticket comprar(Long userId, TipoTicket tipo) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!(usuario instanceof Visitante visitante)) {
            throw new IllegalStateException("Solo los visitantes pueden comprar tickets");
        }

        double precio = PRECIOS.get(tipo);
        if (visitante.getSaldoVirtual() < precio) {
            throw new IllegalStateException("Saldo insuficiente");
        }

        ticketRepository.findByUsuarioIdAndActivoTrue(userId)
            .ifPresent(t -> { t.setActivo(false); ticketRepository.save(t); });

        visitante.setSaldoVirtual(visitante.getSaldoVirtual() - precio);
        usuarioRepository.save(visitante);

        Ticket ticket = new Ticket();
        ticket.setTipo(tipo);
        ticket.setPrecio(precio);
        ticket.setActivo(true);
        ticket.setFechaCompra(LocalDateTime.now());
        ticket.setUsuario(usuario);

        return ticketRepository.save(ticket);
    }
}
