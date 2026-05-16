package com.techpark.service;

import com.techpark.structures.ConjuntoSet;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FavoritosService {

    // userId -> ConjuntoSet de IDs de atracciones favoritas
    private final Map<Long, ConjuntoSet<String>> store = new HashMap<>();

    private ConjuntoSet<String> getSet(Long userId) {
        return store.computeIfAbsent(userId, k -> new ConjuntoSet<>());
    }

    public boolean agregar(Long userId, String atraccionId) {
        return getSet(userId).agregar(atraccionId);
    }

    public boolean eliminar(Long userId, String atraccionId) {
        return getSet(userId).eliminar(atraccionId);
    }

    public boolean contiene(Long userId, String atraccionId) {
        return getSet(userId).contiene(atraccionId);
    }

    public List<String> listar(Long userId) {
        ConjuntoSet<String> set = getSet(userId);
        List<String> result = new ArrayList<>();
        for (int i = 0; i < set.getTamanio(); i++) {
            result.add(set.obtener(i));
        }
        return result;
    }
}
