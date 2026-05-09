package com.techpark.dto;

public record UsuarioResponse(Long id, String email, String nombre, String rol, boolean activo) {
}
