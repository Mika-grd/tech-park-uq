package com.techpark.model;
import com.techpark.structures.*;

import java.util.HashSet;

public class Visitante {
    private String nombre;
    private String documento;
    private int edad;
    private double estatura;
    private double saldoVirtual;
    private Ticket ticket;
    private ListaEnlazada<String> historialVisitas;
    private HashSet<String> favoritos;

    public Visitante(String nombre, String documento, int edad, double estatura, double saldoVirtual, Ticket ticket) {
        this.nombre = nombre;
        this.documento = documento;
        this.edad = edad;
        this.estatura = estatura;
        this.saldoVirtual = saldoVirtual;
        this.ticket = ticket;
        this.historialVisitas = new ListaEnlazada<>();
        this.favoritos = new HashSet<>();
    }

    public String getNombre() {
        return nombre;
    }

    public String getDocumento() {
        return documento;
    }

    public int getEdad() {
        return edad;
    }

    public double getEstatura() {
        return estatura;
    }

    public double getSaldoVirtual() {
        return saldoVirtual;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public ListaEnlazada<String> getHistorialVisitas() {
        return historialVisitas;
    }

    public HashSet<String> getFavoritos() {
        return favoritos;
    }

    public void setSaldoVirtual(double saldoVirtual) {
        this.saldoVirtual = saldoVirtual;
    }

}
