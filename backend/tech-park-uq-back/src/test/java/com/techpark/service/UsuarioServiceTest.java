package com.techpark.service;

import com.techpark.dto.LoginRequest;
import com.techpark.dto.OperadorRequest;
import com.techpark.dto.RegisterRequest;
import com.techpark.dto.UsuarioResponse;
import com.techpark.exception.EmailAlreadyRegisteredException;
import com.techpark.model.Administrador;
import com.techpark.model.Operador;
import com.techpark.model.Usuario;
import com.techpark.model.Visitante;
import com.techpark.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
    }

    // -------------------------------------------------------------------------
    // register()
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("register()")
    class RegisterTests {

        private RegisterRequest requestValido() {
            return new RegisterRequest("juan@test.com", "password123", "Juan", "123456789", 25, 1.75, 0.0);
        }

        @Test
        @DisplayName("Registro exitoso crea un Visitante con los datos correctos")
        void registroExitoso() {
            when(usuarioRepository.existsByEmail("juan@test.com")).thenReturn(false);
            when(usuarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Usuario resultado = usuarioService.register(requestValido());

            assertInstanceOf(Visitante.class, resultado);
            assertEquals("juan@test.com", resultado.getEmail());
            assertEquals("Juan", resultado.getNombre());
            assertTrue(resultado.isActivo());
            verify(usuarioRepository).save(any(Visitante.class));
        }

        @Test
        @DisplayName("Email vacío lanza IllegalArgumentException")
        void emailVacio_lanzaExcepcion() {
            var request = new RegisterRequest("  ", "password123", "Juan", "123456", 25, 1.75, 0.0);

            assertThrows(IllegalArgumentException.class, () -> usuarioService.register(request));
        }

        @Test
        @DisplayName("Contraseña menor a 8 caracteres lanza IllegalArgumentException")
        void passwordCorta_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
            var request = new RegisterRequest("juan@test.com", "abc", "Juan", "123456", 25, 1.75, 0.0);

            assertThrows(IllegalArgumentException.class, () -> usuarioService.register(request));
        }

        @Test
        @DisplayName("Nombre en blanco lanza IllegalArgumentException")
        void nombreEnBlanco_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
            var request = new RegisterRequest("juan@test.com", "password123", "   ", "123456", 25, 1.75, 0.0);

            assertThrows(IllegalArgumentException.class, () -> usuarioService.register(request));
        }

        @Test
        @DisplayName("Documento en blanco lanza IllegalArgumentException")
        void documentoEnBlanco_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
            var request = new RegisterRequest("juan@test.com", "password123", "Juan", "  ", 25, 1.75, 0.0);

            assertThrows(IllegalArgumentException.class, () -> usuarioService.register(request));
        }

        @Test
        @DisplayName("Edad null lanza IllegalArgumentException")
        void edadNull_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
            var request = new RegisterRequest("juan@test.com", "password123", "Juan", "123456", null, 1.75, 0.0);

            assertThrows(IllegalArgumentException.class, () -> usuarioService.register(request));
        }

        @Test
        @DisplayName("Email duplicado lanza EmailAlreadyRegisteredException")
        void emailDuplicado_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail("juan@test.com")).thenReturn(true);

            assertThrows(EmailAlreadyRegisteredException.class, () -> usuarioService.register(requestValido()));
            verify(usuarioRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // crearOperador()
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("crearOperador()")
    class CrearOperadorTests {

        @Test
        @DisplayName("Crea un Operador con zonaAsignada correcta")
        void creaOperadorConZona() {
            when(usuarioRepository.existsByEmail("op@test.com")).thenReturn(false);
            when(usuarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            var request = new OperadorRequest("op@test.com", "password123", "Operador Uno", "Z-01");
            Usuario resultado = usuarioService.crearOperador(request);

            assertInstanceOf(Operador.class, resultado);
            assertEquals("Z-01", ((Operador) resultado).getZonaAsignada());
            assertTrue(resultado.isActivo());
        }

        @Test
        @DisplayName("Contraseña corta lanza IllegalArgumentException")
        void passwordCorta_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
            var request = new OperadorRequest("op@test.com", "123", "Operador", "Z-01");

            assertThrows(IllegalArgumentException.class, () -> usuarioService.crearOperador(request));
        }

        @Test
        @DisplayName("Email duplicado lanza EmailAlreadyRegisteredException")
        void emailDuplicado_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail("op@test.com")).thenReturn(true);
            var request = new OperadorRequest("op@test.com", "password123", "Operador", "Z-01");

            assertThrows(EmailAlreadyRegisteredException.class, () -> usuarioService.crearOperador(request));
        }

        @Test
        @DisplayName("Nombre en blanco lanza IllegalArgumentException")
        void nombreEnBlanco_lanzaExcepcion() {
            when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
            var request = new OperadorRequest("op@test.com", "password123", "  ", "Z-01");

            assertThrows(IllegalArgumentException.class, () -> usuarioService.crearOperador(request));
        }
    }

    // -------------------------------------------------------------------------
    // validateLogin()
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("validateLogin()")
    class ValidateLoginTests {

        @Test
        @DisplayName("Credenciales correctas devuelven el usuario")
        void loginExitoso() {
            Visitante visitante = new Visitante();
            visitante.setEmail("juan@test.com");
            visitante.setPassword("hashed_password");
            visitante.setActivo(true);

            when(usuarioRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(visitante));
            when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);

            var resultado = usuarioService.validateLogin(new LoginRequest("juan@test.com", "password123"));

            assertTrue(resultado.isPresent());
            assertEquals("juan@test.com", resultado.get().getEmail());
        }

        @Test
        @DisplayName("Email no registrado devuelve Optional vacío")
        void emailNoRegistrado_devuelveVacio() {
            when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            var resultado = usuarioService.validateLogin(new LoginRequest("noexiste@test.com", "password123"));

            assertTrue(resultado.isEmpty());
        }

        @Test
        @DisplayName("Contraseña incorrecta devuelve Optional vacío")
        void passwordIncorrecta_devuelveVacio() {
            Visitante visitante = new Visitante();
            visitante.setEmail("juan@test.com");
            visitante.setPassword("hashed_password");
            visitante.setActivo(true);

            when(usuarioRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(visitante));
            when(passwordEncoder.matches("mal_password", "hashed_password")).thenReturn(false);

            var resultado = usuarioService.validateLogin(new LoginRequest("juan@test.com", "mal_password"));

            assertTrue(resultado.isEmpty());
        }

        @Test
        @DisplayName("Usuario inactivo devuelve Optional vacío")
        void usuarioInactivo_devuelveVacio() {
            Visitante visitante = new Visitante();
            visitante.setEmail("juan@test.com");
            visitante.setPassword("hashed_password");
            visitante.setActivo(false);

            when(usuarioRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(visitante));

            var resultado = usuarioService.validateLogin(new LoginRequest("juan@test.com", "password123"));

            assertTrue(resultado.isEmpty());
        }

        @Test
        @DisplayName("Request null devuelve Optional vacío")
        void requestNull_devuelveVacio() {
            var resultado = usuarioService.validateLogin(null);

            assertTrue(resultado.isEmpty());
        }
    }

    // -------------------------------------------------------------------------
    // toUsuarioResponse()
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("toUsuarioResponse()")
    class ToUsuarioResponseTests {

        @Test
        @DisplayName("Visitante incluye documento, edad, estatura y saldo — zonaAsignada null")
        void visitante_mapeaCorrectamente() {
            Visitante v = new Visitante();
            v.setEmail("v@test.com");
            v.setNombre("Visitante");
            v.setActivo(true);
            v.setDocumento("DOC001");
            v.setEdad(20);
            v.setEstatura(1.70);
            v.setSaldoVirtual(5000.0);

            UsuarioResponse res = usuarioService.toUsuarioResponse(v);

            assertEquals("DOC001", res.documento());
            assertEquals(20, res.edad());
            assertEquals(1.70, res.estatura());
            assertEquals(5000.0, res.saldoVirtual());
            assertNull(res.zonaAsignada());
        }

        @Test
        @DisplayName("Operador incluye zonaAsignada — campos de visitante son null")
        void operador_mapeaCorrectamente() {
            Operador op = new Operador();
            op.setEmail("op@test.com");
            op.setNombre("Operador");
            op.setActivo(true);
            op.setZonaAsignada("Z-03");

            UsuarioResponse res = usuarioService.toUsuarioResponse(op);

            assertEquals("Z-03", res.zonaAsignada());
            assertNull(res.documento());
            assertNull(res.saldoVirtual());
        }

        @Test
        @DisplayName("Administrador tiene todos los campos opcionales en null")
        void admin_mapeaCorrectamente() {
            Administrador admin = new Administrador();
            admin.setEmail("admin@test.com");
            admin.setNombre("Admin");
            admin.setActivo(true);

            UsuarioResponse res = usuarioService.toUsuarioResponse(admin);

            assertNull(res.documento());
            assertNull(res.zonaAsignada());
            assertNull(res.saldoVirtual());
            assertEquals("Administrador", res.rol());
        }
    }
}
