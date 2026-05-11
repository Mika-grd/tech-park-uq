package com.techpark.model;

import com.techpark.structures.ListaEnlazada;
import jakarta.persistence.*;

@Entity
@Table(name = "zonas")
public class Zona {

    @Id
    private String id;
    private String nombre;
    private int capacidadMaxima;
    private int visitantesActuales;

    @Transient
    private ListaEnlazada<Atraccion> atracciones = new ListaEnlazada<>();
    @Transient
    private ListaEnlazada<String> operadores = new ListaEnlazada<>();

    public Zona() {
    }

    public Zona(String id, String nombre, int capacidadMaxima) {
        this.id = id;
        this.nombre = nombre;
        this.atracciones = new ListaEnlazada<>();
        this.operadores = new ListaEnlazada<>();
        this.capacidadMaxima = capacidadMaxima;
        this.visitantesActuales = 0;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public ListaEnlazada<Atraccion> getAtracciones() {
        return atracciones;
    }

    public ListaEnlazada<String> getOperadores() {
        return operadores;
    }

    public int getCapacidadMaxima() {
        return capacidadMaxima;
    }

    public void setCapacidadMaxima(int capacidadMaxima) {
        this.capacidadMaxima = capacidadMaxima;
    }

    public int getVisitantesActuales() {
        return visitantesActuales;
    }

    public void setVisitantesActuales(int visitantesActuales) {
        this.visitantesActuales = visitantesActuales;
    }

    public void agregarAtraccion(Atraccion a) {
        atracciones.agregar(a);
    }

    public void agregarOperador(String nombreOperador) {
        operadores.agregar(nombreOperador);
    }
}