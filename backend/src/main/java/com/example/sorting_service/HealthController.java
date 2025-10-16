package com.example.sorting_service;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthController {
  @GetMapping("/ping")
  public Map<String, String> ping() {
    return Map.of("status", "ok");
  }
}