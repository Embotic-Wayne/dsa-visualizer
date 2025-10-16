package com.example.sorting_service;

import org.springframework.web.bind.annotation.*;
import java.util.*; // List, ArrayList, Map, Arrays

@RestController
@RequestMapping("/api/sort")
@CrossOrigin(origins = "http://localhost:3000")
public class SortController {

  @GetMapping("/ping")
  public Map<String, String> ping() { return Map.of("status","sort-ok"); }

  // --- STEP 1: define a step record (i, j, swap?) ---
  public static class Step {
    public int i;
    public int j;
    public boolean swap;
    public Step(int i, int j, boolean swap) { this.i = i; this.j = j; this.swap = swap; }
  }

  public static class SortRequest { public int[] array; }
  public static class StepsResponse {
    public int[] sorted;
    public List<Step> steps;
    public StepsResponse(int[] sorted, List<Step> steps) { this.sorted = sorted; this.steps = steps; }
  }

  // --- STEP 2: bubble sort that records steps ---
  static StepsResponse bubbleWithSteps(int[] a) {
    List<Step> steps = new ArrayList<>();
    for (int end = a.length - 1; end > 0; end--) {
      boolean swapped = false;
      for (int i = 0; i < end; i++) {
        boolean doSwap = a[i] > a[i + 1];
        steps.add(new Step(i, i + 1, doSwap));   // record the comparison (+ whether we’ll swap)
        if (doSwap) {
          int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
          swapped = true;
        }
      }
      if (!swapped) break;
    }
    return new StepsResponse(a, steps);
  }

  // existing instant endpoint (optional to keep)
  public static class SortResponse { public int[] sorted; public SortResponse(int[] s){ this.sorted = s; } }
  @PostMapping("/bubble")
  public SortResponse bubbleEndpoint(@RequestBody SortRequest req) {
    int[] copy = Arrays.copyOf(req.array, req.array.length);
    // plain bubble without steps:
    for (int end = copy.length - 1; end > 0; end--) {
      boolean swapped = false;
      for (int i = 0; i < end; i++) {
        if (copy[i] > copy[i + 1]) {
          int t = copy[i]; copy[i] = copy[i + 1]; copy[i + 1] = t; swapped = true;
        }
      }
      if (!swapped) break;
    }
    return new SortResponse(copy);
  }

  // --- STEP 3: new animated endpoint ---
  @PostMapping("/bubble/steps")
  public StepsResponse bubbleSteps(@RequestBody SortRequest req) {
    int[] copy = Arrays.copyOf(req.array, req.array.length);
    return bubbleWithSteps(copy);
  }
}
