package main.java.com.techpark.model;


public class Operador {
    private String id;
    private String nombre;
    private String zonaAsignada;

    public Operador(String id, String nombre, String zonaAsignada) {
        this.id = id;
        this.nombre = nombre;
        this.zonaAsignada = zonaAsignada;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getZonaAsignada() {
        return zonaAsignada;
    }

    public void setZonaAsignada(String zonaAsignada) {
        this.zonaAsignada = zonaAsignada;
    }

}

