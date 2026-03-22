package com.project.cinema.controller;

import com.project.cinema.dto.AddToListRequest;
import com.project.cinema.dto.AllListsResponse;
import com.project.cinema.dto.RateMovieRequest;
import com.project.cinema.dto.UserMovieListResponse;
import com.project.cinema.service.UserMovieListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-movies")
@RequiredArgsConstructor
public class UserMovieListController {

    private final UserMovieListService userMovieListService;

    // POST /api/user-movies
    // Add movie to any list
    @PostMapping
    public ResponseEntity<UserMovieListResponse> addToList(
            @Valid @RequestBody AddToListRequest request) {
        return ResponseEntity.status( HttpStatus.CREATED)
                .body(userMovieListService.addToList(request));
    }

    // DELETE /api/user-movies/{movieId}/{listType}
    // Remove movie from a specific list
    @DeleteMapping("/{movieId}/{listType}")
    public ResponseEntity<Void> removeFromList(
            @PathVariable Long movieId,
            @PathVariable String listType) {
        userMovieListService.removeFromList(movieId, listType);
        return ResponseEntity.noContent().build(); // 204
    }

    // GET /api/user-movies/me/WATCHED
    // GET /api/user-movies/me/WATCHLIST
    // GET /api/user-movies/me/LIKED
    @GetMapping("/me/{listType}")
    public ResponseEntity<List<UserMovieListResponse>> getMyList(
            @PathVariable String listType) {
        return ResponseEntity.ok(userMovieListService.getMyList(listType));
    }

    // GET /api/user-movies/me/all
    // Get all 3 lists in a single call
    @GetMapping("/me/all")
    public ResponseEntity<AllListsResponse> getAllMyLists() {
        return ResponseEntity.ok(userMovieListService.getAllMyLists());
    }

    // PUT /api/user-movies/{movieId}/rate
    // Rate and review a watched movie
    @PutMapping("/{movieId}/rate")
    public ResponseEntity<UserMovieListResponse> rateMovie(
            @PathVariable Long movieId,
            @Valid @RequestBody RateMovieRequest request) {
        return ResponseEntity.ok(userMovieListService.rateMovie(movieId, request));
    }
}
