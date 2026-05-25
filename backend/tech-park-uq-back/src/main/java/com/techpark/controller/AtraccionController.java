package com.techpark.controller;

import com.techpark.model.Atraccion;
import com.techpark.repository.AtraccionRepository;
import com.techpark.service.BusquedaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atracciones")
@CrossOrigin(origins = "http://localhost:5173")
public class AtraccionController {

    @Autowired
    private AtraccionRepository repository;

    @Autowired
    private BusquedaService busquedaService;

    @GetMapping
    public List<Atraccion> getAll() {
        return repository.findAll();
    }

    @GetMapping("/zona/{zonaId}")
    public List<Atraccion> getByZona(@PathVariable String zonaId) {
        return repository.findByZonaId(zonaId);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Atraccion>> buscar(@RequestParam String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(repository.findAll());
        }
        return ResponseEntity.ok(busquedaService.buscar(q));
    }

    @PostMapping
    public Atraccion save(@RequestBody Atraccion atraccion) {
        return repository.save(atraccion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Atraccion> update(@PathVariable String id, @RequestBody Atraccion atraccion) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        atraccion.setId(id);
        return ResponseEntity.ok(repository.save(atraccion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}