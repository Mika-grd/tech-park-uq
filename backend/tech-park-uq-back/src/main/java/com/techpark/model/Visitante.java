package com.techpark.model;

import com.techpark.structures.ListaEnlazada;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.techpark.structures.ConjuntoSet;

@Entity
@Table(name = "visitante")
@PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
@Getter
@Setter
@NoArgsConstructor
public class Visitante extends Usuario {

    @Column(nullable = false)
    private String documento;

    @Column(nullable = false)
    private int edad;

    @Column(nullable = false)
    private double estatura;

    @Column(name = "saldo_virtual", nullable = false)
    private double saldoVirtual;

    @Transient
    private Ticket ticket;

    @Transient
    private ListaEnlazada<String> historialVisitas = new ListaEnlazada<>();

    @Transient
    private ConjuntoSet<String> favoritos = new ConjuntoSet<>();

    public Visitante(String nombre, String documento, int edad, double estatura, double saldoVirtual, Ticket ticket) {
        setNombre(nombre);
        this.documento = documento;
        this.edad = edad;
        this.estatura = estatura;
        this.saldoVirtual = saldoVirtual;
        this.ticket = ticket;
        this.historialVisitas = new ListaEnlazada<>();
        this.favoritos = new ConjuntoSet<>();
    }

    @Override
    public String getRol() {
        return Rol.Visitante.name();
    }
}
