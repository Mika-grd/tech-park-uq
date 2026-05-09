package com.techpark.repository;

import com.techpark.model.Atraccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AtraccionRepository extends JpaRepository<Atraccion, String> {
    // El segundo parámetro es String porque tu @Id es de tipo String
}
