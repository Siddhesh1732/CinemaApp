package com.project.cinema.controller;

import com.project.cinema.dto.MovieResponse;
import com.project.cinema.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // GET /api/recommendations/me
    // Returns top 10 recommended movies for the logged-in user
    // Automatically protected — requires valid JWT (SecurityConfig handles this)
    @GetMapping("/me")
    public ResponseEntity<List<MovieResponse>> getRecommendations() {
        return ResponseEntity.ok(recommendationService.getRecommendations());
    }
}
