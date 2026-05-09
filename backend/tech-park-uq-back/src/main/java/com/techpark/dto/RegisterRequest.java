package com.techpark.dto;

public record RegisterRequest(
        String email,
        String password,
        String nombre,
        String documento,
        Integer edad,
        Double estatura,
        Double saldoVirtual) {
}
