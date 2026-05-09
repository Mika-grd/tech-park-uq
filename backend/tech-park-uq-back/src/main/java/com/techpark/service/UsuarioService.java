package com.techpark.service;

import com.techpark.dto.LoginRequest;
import com.techpark.dto.UsuarioResponse;
import com.techpark.model.Usuario;
import com.techpark.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Usar al persistir usuarios nuevos o al cambiar contraseña (hash BCrypt).
     */
    public String encodePasswordForStorage(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * Valida credenciales; el JWT se emite en el controller como cookie HttpOnly.
     */
    @Transactional(readOnly = true)
    public Optional<Usuario> validateLogin(LoginRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            return Optional.empty();
        }
        String email = request.email().trim();
        return usuarioRepository
                .findByEmail(email)
                .filter(Usuario::isActivo)
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()));
    }

    public UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public Optional<UsuarioResponse> findById(Long id) {
        return usuarioRepository.findById(id).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<UsuarioResponse> findByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        return usuarioRepository.findByEmail(email.trim()).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return usuarioRepository.existsByEmail(email.trim());
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getRol(),
                usuario.isActivo());
    }
}
