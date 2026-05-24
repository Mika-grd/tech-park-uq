package com.techpark.service;

import com.techpark.model.Ticket.TipoTicket;
import com.techpark.structures.ColaPrioridad;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FilaService {

    private final Map<String, ColaPrioridad<Long>> filas = new HashMap<>();

    private ColaPrioridad<Long> getFila(String atraccionId) {
        return filas.computeIfAbsent(atraccionId, k -> new ColaPrioridad<>());
    }

    public void unirse(Long userId, String atraccionId, TipoTicket tipoTicket) {
        int prioridad = tipoTicket == TipoTicket.FAST_PASS ? 1 : 2;
        getFila(atraccionId).encolar(userId, prioridad);
    }

    public int getPosicion(Long userId, String atraccionId) {
        ColaPrioridad<Long> cola = getFila(atraccionId);
        int posicion = 0;
        ColaPrioridad<Long> temp = new ColaPrioridad<>();
        while (!cola.estaVacia()) {
            Long actual = cola.desencolar();
            posicion++;
            temp.encolar(actual, posicion);
            if (actual.equals(userId)) {
                while (!cola.estaVacia())
                    temp.encolar(cola.desencolar(), posicion + 1);
                while (!temp.estaVacia())
                    cola.encolar(temp.desencolar(), posicion);
                return posicion;
            }
        }
        while (!temp.estaVacia())
            cola.encolar(temp.desencolar(), posicion);
        return -1;
    }

    public boolean salir(Long userId, String atraccionId) {
        ColaPrioridad<Long> cola = getFila(atraccionId);
        ColaPrioridad<Long> temp = new ColaPrioridad<>();
        boolean encontrado = false;
        int posicion = 0;
        while (!cola.estaVacia()) {
            Long actual = cola.desencolar();
            posicion++;
            if (actual.equals(userId)) {
                encontrado = true;
            } else {
                temp.encolar(actual, posicion);
            }
        }
        while (!temp.estaVacia())
            cola.encolar(temp.desencolar(), posicion);
        return encontrado;
    }
}
