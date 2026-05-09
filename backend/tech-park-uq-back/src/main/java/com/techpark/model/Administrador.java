package com.techpark.model;


public class Administrador {
    private String id;
    private String nombre;
    private String email;

    public Administrador(String id, String nombre, String email) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

}
