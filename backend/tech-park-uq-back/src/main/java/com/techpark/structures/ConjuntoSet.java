package com.techpark.structures;

public class ConjuntoSet<T> {
    private ListaEnlazada<T> elementos;

    public ConjuntoSet() {
        this.elementos = new ListaEnlazada<>();
    }

    public boolean agregar(T dato) {
        if (contiene(dato))
            return false;
        elementos.agregar(dato);
        return true;
    }

    public boolean eliminar(T dato) {
        for (int i = 0; i < elementos.getTamanio(); i++) {
            if (elementos.obtener(i).equals(dato)) {
                elementos.eliminar(i);
                return true;
            }
        }
        return false;
    }

    public boolean contiene(T dato) {
        for (int i = 0; i < elementos.getTamanio(); i++) {
            if (elementos.obtener(i).equals(dato))
                return true;
        }
        return false;
    }

    public int getTamanio() {
        return elementos.getTamanio();
    }

    public T obtener(int i) {
        return elementos.obtener(i);
    }

    public boolean estaVacio() {
        return elementos.estaVacia();
    }
}
