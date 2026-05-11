package com.techpark.controller;

import com.techpark.model.Zona;
import com.techpark.repository.ZonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zonas")
@CrossOrigin(origins = "http://localhost:5173")
public class ZonaController {

    @Autowired
    private ZonaRepository repository;

    @GetMapping
    public List<Zona> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Zona zona) {
        if (zona.getVisitantesActuales() > zona.getCapacidadMaxima()) {
            return ResponseEntity.badRequest()
                .body("Los visitantes actuales no pueden superar la capacidad máxima");
        }
        return ResponseEntity.ok(repository.save(zona));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Zona zona) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (zona.getVisitantesActuales() > zona.getCapacidadMaxima()) {
            return ResponseEntity.badRequest()
                .body("Los visitantes actuales no pueden superar la capacidad máxima");
        }
        zona.setId(id);
        return ResponseEntity.ok(repository.save(zona));
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
                    

    
        
    

    