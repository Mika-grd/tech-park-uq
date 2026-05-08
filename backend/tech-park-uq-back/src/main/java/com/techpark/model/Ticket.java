package com.techpark.model;
import com.techpark.structures.*;

public class Ticket {

    public enum TipoTicket {
        GENERAL, FAMILIAR, FAST_PASS
    }

    private TipoTicket tipo;
    private double precio;
    private boolean activo;

    public Ticket(TipoTicket tipo, double precio, boolean activo) {
        this.tipo = tipo;
        this.precio = precio;
        this.activo = activo;
    }

    public TipoTicket getTipo() {
        return tipo;
    }

    public double getPrecio() {
        return precio;
    }

    public boolean isActivo() {
        return activo;
    }

}
