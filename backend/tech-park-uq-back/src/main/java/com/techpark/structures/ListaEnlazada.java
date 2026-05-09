package com.techpark.structures;

public class ListaEnlazada<T> {
    private NodoLista<T> cabeza;
    private int tamanio;

    public ListaEnlazada() {
        this.cabeza = null;
        this.tamanio = 0;
    }

    // Agregar al final
    public void agregar(T dato) {
        NodoLista<T> nuevo = new NodoLista<>(dato);
        if (cabeza == null) {
            cabeza = nuevo;
        } else {
            NodoLista<T> actual = cabeza;
            while (actual.siguiente != null) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevo;
        }
        tamanio++;
    }

    // Eliminar por posición
    public void eliminar(int posicion) {
        if (posicion < 0 || posicion >= tamanio)
            return;
        if (posicion == 0) {
            cabeza = cabeza.siguiente;
        } else {
            NodoLista<T> actual = cabeza;
            for (int i = 0; i < posicion - 1; i++) {
                actual = actual.siguiente;
            }
            actual.siguiente = actual.siguiente.siguiente;
        }
        tamanio--;
    }

    // Obtener por posición
    public T obtener(int posicion) {
        if (posicion < 0 || posicion >= tamanio)
            return null;
        NodoLista<T> actual = cabeza;
        for (int i = 0; i < posicion; i++) {
            actual = actual.siguiente;
        }
        return actual.dato;
    }

    // Ver si está vacía
    public boolean estaVacia() {
        return cabeza == null;
    }

    // Tamaño de la lista
    public int getTamanio() {
        return tamanio;
    }

    // Mostrar todos los elementos
    public void mostrar() {
        NodoLista<T> actual = cabeza;
        while (actual != null) {
            System.out.println(actual.dato);
            actual = actual.siguiente;
        }
    }
}