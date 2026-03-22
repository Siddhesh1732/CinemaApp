package com.project.cinema.service;

import com.project.cinema.dto.GenreRequest;
import com.project.cinema.dto.GenreResponse;
import com.project.cinema.models.Genre;
import com.project.cinema.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;

    // ── Helper: Genre entity → GenreResponse DTO ──────────────────────────
    private GenreResponse toResponse(Genre genre) {
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .description(genre.getDescription())
                .build();
    }

    // ── GET /api/genres ────────────────────────────────────────────────────
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET /api/genres/{id} ───────────────────────────────────────────────
    public GenreResponse getGenreById(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + id));
        return toResponse(genre);
    }

    // ── POST /api/genres (ADMIN) ───────────────────────────────────────────
    public GenreResponse createGenre(GenreRequest request) {

        // Prevent duplicate genre names
        if (genreRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Genre already exists: " + request.getName());
        }

        Genre genre = Genre.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return toResponse(genreRepository.save(genre));
    }

    // ── PUT /api/genres/{id} (ADMIN) ───────────────────────────────────────
    public GenreResponse updateGenre(Long id, GenreRequest request) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + id));

        if (request.getName() != null)        genre.setName(request.getName());
        if (request.getDescription() != null) genre.setDescription(request.getDescription());

        return toResponse(genreRepository.save(genre));
    }

    // ── DELETE /api/genres/{id} (ADMIN) ───────────────────────────────────
    public void deleteGenre(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new RuntimeException("Genre not found with id: " + id);
        }
        genreRepository.deleteById(id);
    }
}