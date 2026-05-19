package com.techpark.repository;

import com.techpark.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByUsuarioIdAndActivoTrue(Long usuarioId);
    List<Ticket> findByUsuarioId(Long usuarioId);
}
