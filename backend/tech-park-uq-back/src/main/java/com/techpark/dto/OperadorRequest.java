package com.techpark.dto;

public record OperadorRequest(
        String email,
        String password,
        String nombre,
        String zonaAsignada) {
}
