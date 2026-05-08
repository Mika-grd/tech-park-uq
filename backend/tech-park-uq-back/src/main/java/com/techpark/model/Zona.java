package com.techpark.model;
import com.techpark.structures.*;

public class Zona {
    private String id;
    private String nombre;
    private ListaEnlazada<Atraccion> atracciones;
    private ListaEnlazada<String> operadores;
    private int capacidadMaxima;
    private int visitantesActuales;

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

    public String getNombre() {
        return nombre;
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

    public int getVisitantesActuales() {
        return visitantesActuales;
    }

    public void agregarAtraccion(Atraccion a) {
        atracciones.agregar(a);
    }

    public void agregarOperador(String nombreOperador) {
        operadores.agregar(nombreOperador);
    }

    public void setVisitantesActuales(int visitantesActuales) {
        this.visitantesActuales = visitantesActuales;
    }
}
