package com.techpark.controller;

import com.techpark.model.Atraccion;
import com.techpark.repository.AtraccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atracciones")
@CrossOrigin(origins = "http://localhost:5173") // Esto es vital para que tu React no de error de CORS
public class AtraccionController {

    @Autowired
    private AtraccionRepository repository;

    @GetMapping
    public List<Atraccion> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Atraccion save(@RequestBody Atraccion atraccion) {
        return repository.save(atraccion);
    }
}
