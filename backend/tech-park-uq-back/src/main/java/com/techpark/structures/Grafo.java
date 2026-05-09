package com.techpark.structures;

public class Grafo {
    private ListaEnlazada<NodoGrafo> nodos;

    public Grafo() {
        this.nodos = new ListaEnlazada<>();
    }

    // Agregar una atracción al grafo
    public void agregarNodo(String nombre) {
        NodoGrafo nuevo = new NodoGrafo(nombre);
        nodos.agregar(nuevo);
    }

    // Agregar camino entre dos atracciones
    public void agregarArista(String origen, String destino, int peso) {
        NodoGrafo nodoOrigen = buscarNodo(origen);
        if (nodoOrigen != null) {
            Arista arista = new Arista(destino, peso);
            nodoOrigen.getVecinos().agregar(arista);
        }
    }

    // Buscar un nodo por nombre
    public NodoGrafo buscarNodo(String nombre) {
        for (int i = 0; i < nodos.getTamanio(); i++) {
            NodoGrafo actual = nodos.obtener(i);
            if (actual.getNombre().equals(nombre)) {
                return actual;
            }
        }
        return null;
    }

    public void mostrar() {
        for (int i = 0; i < nodos.getTamanio(); i++) {
            NodoGrafo actual = nodos.obtener(i);
            System.out.println("Atracción: " + actual.getNombre());

            for (int j = 0; j < actual.getVecinos().getTamanio(); j++) {
                Arista arista = actual.getVecinos().obtener(j);
                System.out.println("  → " + arista.getDestino() + " (peso: " + arista.getPeso() + ")");
            }
        }
    }

    // Algoritmo de dijkstra
    public ListaEnlazada<String> dijkstra(String origen, String destino) {
        java.util.HashMap<String, Integer> distancias = new java.util.HashMap<>();
        java.util.HashMap<String, String> anteriores = new java.util.HashMap<>();
        java.util.PriorityQueue<String> cola = new java.util.PriorityQueue<>(
                (a, b) -> distancias.get(a) - distancias.get(b));

        // inicializar todas las distancias en infinito
        for (int i = 0; i < nodos.getTamanio(); i++) {
            distancias.put(nodos.obtener(i).getNombre(), Integer.MAX_VALUE);
        }

        // la distancia al origen es 0
        distancias.put(origen, 0);
        cola.add(origen);

        while (!cola.isEmpty()) {
            String actual = cola.poll();
            if (actual.equals(destino))
                break;

            NodoGrafo nodoActual = buscarNodo(actual);
            if (nodoActual == null)
                continue;

            for (int i = 0; i < nodoActual.getVecinos().getTamanio(); i++) {
                Arista arista = nodoActual.getVecinos().obtener(i);
                int nuevaDistancia = distancias.get(actual) + arista.getPeso();
                if (nuevaDistancia < distancias.get(arista.getDestino())) {
                    distancias.put(arista.getDestino(), nuevaDistancia);
                    anteriores.put(arista.getDestino(), actual);
                    cola.add(arista.getDestino());
                }
            }
        }

        // reconstruir la ruta
        ListaEnlazada<String> ruta = new ListaEnlazada<>();
        String paso = destino;
        while (paso != null) {
            ruta.agregar(paso);
            paso = anteriores.get(paso);
        }
        return ruta;
    }
}
