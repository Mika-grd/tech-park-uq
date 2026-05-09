package com.techpark.structures;

public class ColaPrioridad<T> {
    private NodoCola<T> cabeza;
    private int tamanio;

    public ColaPrioridad() {
        this.cabeza = null;
        this.tamanio = 0;
    }

    // Insertar respetando prioridad
    public void encolar(T dato, int prioridad) {
        NodoCola<T> nuevo = new NodoCola<>(dato, prioridad);
        if (cabeza == null || prioridad < cabeza.prioridad) {
            nuevo.siguiente = cabeza;
            cabeza = nuevo;
        } else {
            NodoCola<T> actual = cabeza;
            while (actual.siguiente != null && actual.siguiente.prioridad <= prioridad) {
                actual = actual.siguiente;
            }
            nuevo.siguiente = actual.siguiente;
            actual.siguiente = nuevo;
        }
        tamanio++;
    }

    // Sacar el primero de la cola
    public T desencolar() {
        if (cabeza == null)
            return null;
        T dato = cabeza.dato;
        cabeza = cabeza.siguiente;
        tamanio--;
        return dato;
    }

    // Ver el primero sin sacarlo
    public T verPrimero() {
        if (cabeza == null)
            return null;
        return cabeza.dato;
    }

    public boolean estaVacia() {
        return cabeza == null;
    }

    public int getTamanio() {
        return tamanio;
    }

    public void mostrar() {
        NodoCola<T> actual = cabeza;
        while (actual != null) {
            System.out.println("Prioridad " + actual.prioridad + ": " + actual.dato);
            actual = actual.siguiente;
        }
    }
}