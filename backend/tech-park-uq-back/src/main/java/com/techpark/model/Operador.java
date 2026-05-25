package com.techpark.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "operador")
@PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
@Getter
@Setter
@NoArgsConstructor
public class Operador extends Usuario {

    @Column(name = "zona_asignada")
    private String zonaAsignada;

    public Operador(String nombre, String zonaAsignada) {
        setNombre(nombre);
        this.zonaAsignada = zonaAsignada;
    }

    @Override
    public String getRol() {
        return "Operador";
    }
}
