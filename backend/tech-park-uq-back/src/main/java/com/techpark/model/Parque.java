package com.techpark.model;
import com.techpark.structures.*;


public class Parque {
    private String nombre;
    private ListaEnlazada<Zona> zonas;
    private ListaEnlazada<Visitante> visitantes;
    private ListaEnlazada<Operador> operadores;
    private Grafo mapa;
    private int capacidadMaxima;
    private int visitantesActuales;

    public Parque(String nombre, int capacidadMaxima) {
        this.nombre = nombre;
        this.capacidadMaxima = capacidadMaxima;
        this.zonas = new ListaEnlazada<>();
        this.visitantes = new ListaEnlazada<>();
        this.operadores = new ListaEnlazada<>();
        this.mapa = new Grafo();
        this.visitantesActuales = 0;
    }

    // Agregar zona al parque
    public void agregarZona(Zona zona) {
        zonas.agregar(zona);
    }

    // Registrar visitante
    public void registrarVisitante(Visitante v) {
        if (visitantesActuales < capacidadMaxima) {
            visitantes.agregar(v);
            visitantesActuales++;
        } else {
            System.out.println("Se alcanzo la capacidad maxima");
            return;
        }
    }

    // Buscar zona por id
    public Zona buscarZona(String id) {
        for (int i = 0; i < zonas.getTamanio(); i++) {
            Zona actual = zonas.obtener(i);
            if (actual.getId().equals(id)) {
                return actual;
            }
        }
        return null;
    }

    // Agregar operador
    public void agregarOperador(Operador o) {
        operadores.agregar(o);
    }

    public boolean validarAcceso(Visitante v, Atraccion a) {
        // 1. verificar que la atracción esté ACTIVA
        if (!a.getEstado().equals(Atraccion.Estado.ACTIVA)) {
            System.out.println("La atracción no está disponible");
            return false;
        }
        // 2. verificar altura
        if (v.getEstatura() < a.getAlturaMinima()) {
            System.out.println("No cumple la altura mínima");
            return false;
        }
        // 3. verificar edad
        if (v.getEdad() < a.getEdadMinima()) {
            System.out.println("No cumple la edad mínima");
            return false;
        }
        // 4. verificar saldo si ticket es General y hay costo adicional
        if (v.getTicket().getTipo().equals(Ticket.TipoTicket.GENERAL) && a.getCostoAdicional() > 0) {
            if (v.getSaldoVirtual() < a.getCostoAdicional()) {
                System.out.println("Saldo insuficiente");
                return false;
            }
            v.setSaldoVirtual(v.getSaldoVirtual() - a.getCostoAdicional());
        }
        return true;
    }

    public void registrarIngresoAtraccion(Visitante v, Atraccion a) {
        if (validarAcceso(v, a)) {
            // suma 1 a los visitantes acumulados de la atracción
            a.setVisitantesAcumulados(a.getVisitantesAcumulados() + 1);
            // agrega la atracción al historial del visitante
            v.getHistorialVisitas().agregar(a.getNombre());
            // verifica si llegó a 500
            if (a.getVisitantesAcumulados() >= 500) {
                a.setEstado(Atraccion.Estado.EN_MANTENIMIENTO);
                a.setMotivoCierre("Mantenimiento preventivo: límite de 500 visitantes alcanzado");
                System.out.println("Atracción " + a.getNombre() + " bloqueada para mantenimiento");
            }
        }
    }

    public void activarAlertaClimatica(String motivo) {
        for (int i = 0; i < zonas.getTamanio(); i++) {
            Zona zona = zonas.obtener(i);
            for (int j = 0; j < zona.getAtracciones().getTamanio(); j++) {
                Atraccion a = zona.getAtracciones().obtener(j);
                if (a.getTipo().equals(Atraccion.Tipo.ACUATICA) || a.getTipo().equals(Atraccion.Tipo.MECANICA_ALTURA)) {
                    a.setEstado(Atraccion.Estado.CERRADA);
                    a.setMotivoCierre(motivo);
                    System.out.println("Atracción " + a.getNombre() + " cerrada por alerta climática");
                }
            }
        }
    }
}