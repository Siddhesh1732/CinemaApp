package com.project.cinema.service;


import com.project.cinema.dto.MovieRequest;
import com.project.cinema.dto.MovieResponse;
import com.project.cinema.models.CastMember;
import com.project.cinema.models.Genre;
import com.project.cinema.models.Movie;
import com.project.cinema.repository.CastMemberRepository;
import com.project.cinema.repository.GenreRepository;
import com.project.cinema.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final CastMemberRepository castMemberRepository;

    // ── Helper: convert Movie entity → MovieResponse DTO ──────────────────
    private MovieResponse toResponse(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .releaseYear(movie.getReleaseYear())
                .description(movie.getDescription())
                .posterUrl(movie.getPosterUrl())
                .trailerUrl(movie.getTrailerUrl())
                .language(movie.getLanguage())
                .country(movie.getCountry())
                .durationMinutes(movie.getDurationMinutes())
                .status(movie.getStatus().name())
                .averageRating(movie.getAverageRating())
                .totalRatings(movie.getTotalRatings())
                .genres(movie.getGenres()
                        .stream()
                        .map(Genre::getName)
                        .collect(Collectors.toList()))
                .castMembers(movie.getCastMembers()
                        .stream()
                        .map(CastMember::getName)
                        .collect(Collectors.toList()))
                .build();
    }

    // ── GET /api/movies ────────────────────────────────────────────────────
    // Returns paginated list of movies
    // Pageable handles ?page=0&size=10&sort=releaseYear,desc automatically
    public Page<MovieResponse> getAllMovies(Pageable pageable) {
        return movieRepository.findAll(pageable)
                .map(this::toResponse);
    }

    // ── GET /api/movies/{id} ───────────────────────────────────────────────
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));
        return toResponse(movie);
    }

    // ── GET /api/movies/search?q=inception ────────────────────────────────
    public List<MovieResponse> searchMovies(String query) {
        return movieRepository.findByTitleContainingIgnoreCase(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── POST /api/movies (ADMIN) ───────────────────────────────────────────
    public MovieResponse createMovie(MovieRequest request) {

        // Fetch genres by IDs sent in request
        List<Genre> genres = genreRepository.findAllById(request.getGenreIds());

        // Fetch cast members by IDs sent in request
        List<CastMember> castMembers = castMemberRepository.findAllById(request.getCastMemberIds());

        Movie movie = Movie.builder()
                .title(request.getTitle())
                .releaseYear(request.getReleaseYear())
                .description(request.getDescription())
                .posterUrl(request.getPosterUrl())
                .trailerUrl(request.getTrailerUrl())
                .language(request.getLanguage())
                .country(request.getCountry())
                .durationMinutes(request.getDurationMinutes())
                .status(Movie.MovieStatus.valueOf(request.getStatus()))
                .genres(genres)
                .castMembers(castMembers)
                .build();

        return toResponse(movieRepository.save(movie));
    }

    // ── PUT /api/movies/{id} (ADMIN) ───────────────────────────────────────
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));

        // Only update fields that were sent
        if (request.getTitle() != null)           movie.setTitle(request.getTitle());
        if (request.getReleaseYear() != null)      movie.setReleaseYear(request.getReleaseYear());
        if (request.getDescription() != null)      movie.setDescription(request.getDescription());
        if (request.getPosterUrl() != null)        movie.setPosterUrl(request.getPosterUrl());
        if (request.getTrailerUrl() != null)       movie.setTrailerUrl(request.getTrailerUrl());
        if (request.getLanguage() != null)         movie.setLanguage(request.getLanguage());
        if (request.getCountry() != null)          movie.setCountry(request.getCountry());
        if (request.getDurationMinutes() != null)  movie.setDurationMinutes(request.getDurationMinutes());
        if (request.getStatus() != null)           movie.setStatus(Movie.MovieStatus.valueOf(request.getStatus()));

        if (request.getGenreIds() != null) {
            movie.setGenres(genreRepository.findAllById(request.getGenreIds()));
        }
        if (request.getCastMemberIds() != null) {
            movie.setCastMembers(castMemberRepository.findAllById(request.getCastMemberIds()));
        }

        return toResponse(movieRepository.save(movie));
    }

    // ── DELETE /api/movies/{id} (ADMIN) ───────────────────────────────────
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new RuntimeException("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
    }
}
