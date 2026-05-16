package com.techpark.service;

import com.techpark.structures.ListaEnlazada;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HistorialService {

    private final Map<Long, ListaEnlazada<String>> store = new HashMap<>();

    private ListaEnlazada<String> getLista(Long userId) {
        return store.computeIfAbsent(userId, k -> new ListaEnlazada<>());
    }

    public void registrar(Long userId, String atraccionId) {
        getLista(userId).agregar(atraccionId);
    }

    public List<String> listar(Long userId) {
        ListaEnlazada<String> lista = getLista(userId);
        List<String> result = new ArrayList<>();
        for (int i = 0; i < lista.getTamanio(); i++) {
            result.add(lista.obtener(i));
        }
        return result;
    }
}
