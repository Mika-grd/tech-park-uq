package com.techpark.service;

import com.techpark.model.Atraccion;
import com.techpark.repository.AtraccionRepository;
import com.techpark.structures.ArbolBST;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusquedaService {

    @Autowired
    private AtraccionRepository atraccionRepository;

    public List<Atraccion> buscar(String query) {
        List<Atraccion> todas = atraccionRepository.findAll();

        ArbolBST<String> arbol = new ArbolBST<>();
        for (Atraccion a : todas) {
            arbol.insertar(a.getNombre().toLowerCase());
        }

        String q = query.toLowerCase();
        List<String> nombresOrdenados = arbol.inordenLista();
        List<String> coincidencias = nombresOrdenados.stream()
                .filter(n -> n.contains(q))
                .collect(Collectors.toList());

        return coincidencias.stream()
                .flatMap(nombre -> todas.stream()
                        .filter(a -> a.getNombre().toLowerCase().equals(nombre)))
                .collect(Collectors.toList());
    }
}
