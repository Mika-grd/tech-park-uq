package com.techpark.structures;

public class NodoGrafo {
    private String nombre;
    private ListaEnlazada<Arista> vecinos;

    public NodoGrafo(String nombre) {
        this.nombre = nombre;
        this.vecinos = new ListaEnlazada<>();
    }

    public String getNombre() {
        return nombre;
    }

    public ListaEnlazada<Arista> getVecinos() {
        return vecinos;
    }
}
