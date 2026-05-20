package com.techpark.controller;

import com.techpark.service.RutaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ruta")
public class RutaController {

    @Autowired
    private RutaService rutaService;

    @GetMapping
    public ResponseEntity<?> calcularRuta(
            @RequestParam String origen,
            @RequestParam String destino) {
        try {
            List<String> ruta = rutaService.calcularRuta(origen, destino);
            if (ruta.isEmpty()) {
                return ResponseEntity.ok(Map.of("ruta", List.of(), "mensaje", "No se encontró ruta"));
            }
            return ResponseEntity.ok(Map.of("ruta", ruta));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
