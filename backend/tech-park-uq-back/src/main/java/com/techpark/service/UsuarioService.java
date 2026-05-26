package com.techpark.service;

import com.techpark.dto.LoginRequest;
import com.techpark.dto.OperadorRequest;
import com.techpark.dto.RegisterRequest;
import com.techpark.dto.UsuarioResponse;
import com.techpark.exception.EmailAlreadyRegisteredException;
import com.techpark.model.Operador;
import com.techpark.model.Usuario;
import com.techpark.model.Visitante;
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

    /**
     * Registro público: crea un {@link Visitante}.
     *
     * @throws IllegalArgumentException datos inválidos o incompletos
     * @throws EmailAlreadyRegisteredException si el correo ya está en uso
     */
    @Transactional
    public Usuario register(RegisterRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            throw new IllegalArgumentException("Solicitud inválida");
        }
        String email = request.email().trim();
        if (email.isEmpty()) {
            throw new IllegalArgumentException("Correo requerido");
        }
        if (emailExists(email)) {
            throw new EmailAlreadyRegisteredException();
        }
        if (request.password().length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        }
        if (request.nombre() == null || request.nombre().isBlank()) {
            throw new IllegalArgumentException("Nombre requerido");
        }
        if (request.documento() == null || request.documento().isBlank()) {
            throw new IllegalArgumentException("Documento requerido");
        }
        if (request.edad() == null || request.estatura() == null) {
            throw new IllegalArgumentException("Edad y estatura requeridos");
        }
        if (request.edad() < 0 || request.estatura() < 0) {
            throw new IllegalArgumentException("Edad y estatura deben ser no negativos");
        }

        Visitante visitante = new Visitante();
        visitante.setEmail(email);
        visitante.setPassword(encodePasswordForStorage(request.password()));
        visitante.setNombre(request.nombre().trim());
        visitante.setDocumento(request.documento().trim());
        visitante.setEdad(request.edad());
        visitante.setEstatura(request.estatura());
        double saldo = request.saldoVirtual() != null ? request.saldoVirtual() : 0.0;
        visitante.setSaldoVirtual(saldo);
        visitante.setActivo(true);

        return usuarioRepository.save(visitante);
    }

    @Transactional
    public Usuario crearAdmin(RegisterRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            throw new IllegalArgumentException("Solicitud inválida");
        }
        String email = request.email().trim();
        if (email.isEmpty()) throw new IllegalArgumentException("Correo requerido");
        if (emailExists(email)) throw new EmailAlreadyRegisteredException();
        if (request.password().length() < 8) throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        if (request.nombre() == null || request.nombre().isBlank()) throw new IllegalArgumentException("Nombre requerido");

        com.techpark.model.Administrador admin = new com.techpark.model.Administrador();
        admin.setEmail(email);
        admin.setPassword(encodePasswordForStorage(request.password()));
        admin.setNombre(request.nombre().trim());
        admin.setActivo(true);

        return usuarioRepository.save(admin);
    }

    @Transactional
    public Usuario crearOperador(OperadorRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            throw new IllegalArgumentException("Solicitud inválida");
        }
        String email = request.email().trim();
        if (email.isEmpty()) throw new IllegalArgumentException("Correo requerido");
        if (emailExists(email)) throw new EmailAlreadyRegisteredException();
        if (request.password().length() < 8) throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        if (request.nombre() == null || request.nombre().isBlank()) throw new IllegalArgumentException("Nombre requerido");

        Operador operador = new Operador();
        operador.setEmail(email);
        operador.setPassword(encodePasswordForStorage(request.password()));
        operador.setNombre(request.nombre().trim());
        operador.setZonaAsignada(request.zonaAsignada() != null ? request.zonaAsignada().trim() : null);
        operador.setActivo(true);

        return usuarioRepository.save(operador);
    }

    @Transactional
    public Usuario addSaldoToUser(long userId, Double amount) {
        if (amount == null || amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        if (!(usuario instanceof Visitante v)) {
            throw new IllegalArgumentException("Solo los visitantes pueden recargar saldo");
        }
        v.setSaldoVirtual(v.getSaldoVirtual() + amount);
        return usuarioRepository.save(v);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        String zonaAsignada = (usuario instanceof Operador op) ? op.getZonaAsignada() : null;
        if (usuario instanceof Visitante v) {
            return new UsuarioResponse(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getRol(),
                usuario.isActivo(),
                v.getDocumento(),
                v.getEdad(),
                v.getEstatura(),
                v.getSaldoVirtual(),
                null
            );
        }
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getNombre(),
            usuario.getRol(),
            usuario.isActivo(),
            null,
            null,
            null,
            null,
            zonaAsignada
        );
    }
}
