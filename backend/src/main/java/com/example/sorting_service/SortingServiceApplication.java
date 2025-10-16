package com.example.sorting_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example.sorting_service")
public class SortingServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(SortingServiceApplication.class, args);
  }
}