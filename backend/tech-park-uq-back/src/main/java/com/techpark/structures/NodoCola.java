package com.techpark.structures;

public class NodoCola<T> {
    public T dato;
    public int prioridad;
    public NodoCola<T> siguiente;

    public NodoCola(T dato, int prioridad) {
        this.dato = dato;
        this.prioridad = prioridad;
        this.siguiente = null;
    }
}
