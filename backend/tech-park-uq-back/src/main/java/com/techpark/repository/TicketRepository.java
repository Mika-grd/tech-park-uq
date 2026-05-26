package com.techpark.repository;

import com.techpark.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByUsuarioIdAndActivoTrue(Long usuarioId);
    List<Ticket> findByUsuarioId(Long usuarioId);

    @Query("SELECT COALESCE(SUM(t.precio), 0) FROM Ticket t WHERE t.fechaCompra >= :inicio AND t.fechaCompra < :fin")
    double sumRecaudacion(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.fechaCompra >= :inicio AND t.fechaCompra < :fin")
    long countVentas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}
