package com.techpark.model;

import jakarta.persistence.*;

@Entity
@Table(name = "atracciones")
public class Atraccion {

    public void setId(String id) {
        this.id = id;
    }

    public enum Tipo {
        ACUATICA, MECANICA_ALTURA, OTRO
    }

    public enum Estado {
        ACTIVA, EN_MANTENIMIENTO, CERRADA
    }

    @Id
    private String id; // Usamos tu String id como Llave Primaria

    private String nombre;

    @Enumerated(EnumType.STRING) // Guarda el nombre del enum (ej: "ACUATICA") y no un número
    private Tipo tipo;

    private int capacidadMaxima;
    private double alturaMinima;
    private int edadMinima;
    private double costoAdicional;
    private int visitantesAcumulados;
    private int tiempoEspera;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    private String motivoCierre;

    @Column(name = "zona_id")
    private String zonaId;

    @Column(name = "operador_id")
    private Long operadorId;

    // Constructor vacío obligatorio para JPA
    public Atraccion() {
    }

    public Atraccion(String id, String nombre, Tipo tipo, int capacidadMaxima, double alturaMinima, int edadMinima,
            double costoAdicional, int tiempoEspera, Estado estado, String motivoCierre) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.capacidadMaxima = capacidadMaxima;
        this.alturaMinima = alturaMinima;
        this.edadMinima = edadMinima;
        this.costoAdicional = costoAdicional;
        this.visitantesAcumulados = 0;
        this.tiempoEspera = tiempoEspera;
        this.estado = estado;
        this.motivoCierre = motivoCierre;
    }

    // Getters y Setters (Mantén los que ya tenías)
    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Tipo getTipo() {
        return tipo;
    }

    public int getCapacidadMaxima() {
        return capacidadMaxima;
    }

    public double getAlturaMinima() {
        return alturaMinima;
    }

    public int getEdadMinima() {
        return edadMinima;
    }

    public double getCostoAdicional() {
        return costoAdicional;
    }

    public int getVisitantesAcumulados() {
        return visitantesAcumulados;
    }

    public void setVisitantesAcumulados(int visitantesAcumulados) {
        this.visitantesAcumulados = visitantesAcumulados;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public int getTiempoEspera() {
        return tiempoEspera;
    }

    public void setTiempoEspera(int tiempoEspera) {
        this.tiempoEspera = tiempoEspera;
    }

    public String getMotivoCierre() {
        return motivoCierre;
    }

    public void setMotivoCierre(String motivoCierre) {
        this.motivoCierre = motivoCierre;
    }

    public String getZonaId() {
        return zonaId;
    }

    public void setZonaId(String zonaId) {
        this.zonaId = zonaId;
    }

    public Long getOperadorId() {
        return operadorId;
    }

    public void setOperadorId(Long operadorId) {
        this.operadorId = operadorId;
    }
}