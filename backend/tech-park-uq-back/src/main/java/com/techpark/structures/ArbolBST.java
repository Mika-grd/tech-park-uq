package com.techpark.structures;
public class ArbolBST<T extends Comparable<T>> {
    private NodoArbol<T> raiz;

    public ArbolBST() {
        this.raiz = null;
    }

    public void insertar(T dato) {
        raiz = insertarRec(raiz, dato);
    }

    private NodoArbol<T> insertarRec(NodoArbol<T> nodo, T dato) {
        if (nodo == null) {
            return new NodoArbol<>(dato);
        }
        if (dato.compareTo(nodo.dato) < 0) {
            nodo.izquierdo = insertarRec(nodo.izquierdo, dato);
        } else {
            nodo.derecho = insertarRec(nodo.derecho, dato);
        }
        return nodo;
    }

    public boolean buscar(T dato) {
        return buscarRec(raiz, dato);
    }

    private boolean buscarRec(NodoArbol<T> nodo, T dato) {
        if (nodo == null) {
            return false;
        }
        if (dato.compareTo(nodo.dato) == 0) {
            return true;
        }
        if (dato.compareTo(nodo.dato) < 0) {
            return buscarRec(nodo.izquierdo, dato);
        } else {
            return buscarRec(nodo.derecho, dato);
        }
    }

    public void inorden() {
        inordenRec(raiz);
    }

    private void inordenRec(NodoArbol<T> nodo) {
        if (nodo == null) {
            return;
        }
        inordenRec(nodo.izquierdo);
        System.out.println(nodo.dato);
        inordenRec(nodo.derecho);
    }

    public java.util.List<T> inordenLista() {
        java.util.List<T> lista = new java.util.ArrayList<>();
        inordenListaRec(raiz, lista);
        return lista;
    }

    private void inordenListaRec(NodoArbol<T> nodo, java.util.List<T> lista) {
        if (nodo == null) return;
        inordenListaRec(nodo.izquierdo, lista);
        lista.add(nodo.dato);
        inordenListaRec(nodo.derecho, lista);
    }
}