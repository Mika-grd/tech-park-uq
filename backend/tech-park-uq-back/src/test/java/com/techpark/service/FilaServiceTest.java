package com.techpark.service;

import com.techpark.model.Ticket.TipoTicket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FilaServiceTest {

    private FilaService filaService;

    @BeforeEach
    void setUp() {
        filaService = new FilaService();
    }

    @Test
    @DisplayName("Un solo usuario en la fila ocupa la posición 1")
    void unUsuario_posicion1() {
        filaService.unirse(1L, "A-01", TipoTicket.GENERAL);

        int posicion = filaService.getPosicion(1L, "A-01");

        assertEquals(1, posicion);
    }

    @Test
    @DisplayName("FAST_PASS queda delante de GENERAL aunque se una después")
    void fastPassAdelantaAGeneral() {
        filaService.unirse(1L, "A-01", TipoTicket.GENERAL);
        filaService.unirse(2L, "A-01", TipoTicket.FAST_PASS);

        assertEquals(1, filaService.getPosicion(2L, "A-01"));
        assertEquals(2, filaService.getPosicion(1L, "A-01"));
    }

    @Test
    @DisplayName("Dos usuarios GENERAL mantienen el orden de llegada")
    void dosGenerales_ordenDeLlegada() {
        filaService.unirse(10L, "A-02", TipoTicket.GENERAL);
        filaService.unirse(20L, "A-02", TipoTicket.GENERAL);

        assertEquals(1, filaService.getPosicion(10L, "A-02"));
        assertEquals(2, filaService.getPosicion(20L, "A-02"));
    }

    @Test
    @DisplayName("Usuario que no está en la fila devuelve -1")
    void usuarioAusente_devuelveMenosUno() {
        int posicion = filaService.getPosicion(99L, "A-03");

        assertEquals(-1, posicion);
    }

    @Test
    @DisplayName("Salir elimina al usuario de la fila")
    void salir_eliminaAlUsuario() {
        filaService.unirse(1L, "A-01", TipoTicket.GENERAL);
        filaService.unirse(2L, "A-01", TipoTicket.GENERAL);

        boolean salioOk = filaService.salir(1L, "A-01");

        assertTrue(salioOk);
        assertEquals(-1, filaService.getPosicion(1L, "A-01"));
        assertEquals(1, filaService.getPosicion(2L, "A-01"));
    }

    @Test
    @DisplayName("Salir de una fila en la que no estás devuelve false")
    void salir_usuarioNoEncontrado_devuelveFalse() {
        boolean resultado = filaService.salir(99L, "A-01");

        assertFalse(resultado);
    }

    @Test
    @DisplayName("Las filas de distintas atracciones son independientes")
    void filasDeAtraccionesSonIndependientes() {
        filaService.unirse(1L, "A-01", TipoTicket.GENERAL);
        filaService.unirse(1L, "A-02", TipoTicket.GENERAL);

        assertEquals(1, filaService.getPosicion(1L, "A-01"));
        assertEquals(1, filaService.getPosicion(1L, "A-02"));
        assertEquals(-1, filaService.getPosicion(1L, "A-03"));
    }
}
