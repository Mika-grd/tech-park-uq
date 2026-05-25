package com.techpark.repository;

import com.techpark.model.Atraccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AtraccionRepository extends JpaRepository<Atraccion, String> {
    java.util.List<Atraccion> findByZonaId(String zonaId);
    java.util.List<Atraccion> findByTipoIn(java.util.List<Atraccion.Tipo> tipos);
    java.util.List<Atraccion> findByEstadoAndMotivoCierreStartingWith(Atraccion.Estado estado, String prefix);
    java.util.List<Atraccion> findByEstado(Atraccion.Estado estado);
}
