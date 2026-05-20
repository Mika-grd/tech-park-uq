package com.techpark.service;

import com.techpark.model.Atraccion;
import com.techpark.repository.AtraccionRepository;
import com.techpark.structures.Grafo;
import com.techpark.structures.ListaEnlazada;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class RutaService {

    @Autowired
    private AtraccionRepository atraccionRepository;

    public List<String> calcularRuta(String origenId, String destinoId) {
        List<Atraccion> atracciones = new ArrayList<>(atraccionRepository.findAll());
        // Mismo orden que el frontend: por ID alfabético
        atracciones.sort(Comparator.comparing(Atraccion::getId));

        int n = atracciones.size();
        if (n == 0) return List.of();

        int cols = (int) Math.ceil(Math.sqrt(n));

        Grafo grafo = new Grafo();
        for (Atraccion a : atracciones) {
            grafo.agregarNodo(a.getId());
        }

        for (int i = 0; i < n; i++) {
            int col = i % cols;
            String idA = atracciones.get(i).getId();

            // Vecino derecho
            if (col + 1 < cols && i + 1 < n) {
                String idB = atracciones.get(i + 1).getId();
                grafo.agregarArista(idA, idB, 1);
                grafo.agregarArista(idB, idA, 1);
            }

            // Vecino de abajo
            if (i + cols < n) {
                String idC = atracciones.get(i + cols).getId();
                grafo.agregarArista(idA, idC, 1);
                grafo.agregarArista(idC, idA, 1);
            }
        }

        ListaEnlazada<String> resultado = grafo.dijkstra(origenId, destinoId);
        List<String> ruta = new ArrayList<>();
        for (int i = 0; i < resultado.getTamanio(); i++) {
            ruta.add(resultado.obtener(i));
        }
        return ruta;
    }
}
