package main.java.com.techpark.model;

public class NodoLista<T> {
    public T dato;
    public NodoLista<T> siguiente;

    public NodoLista(T dato) {
        this.dato = dato;
        this.siguiente = null;
    }
}
