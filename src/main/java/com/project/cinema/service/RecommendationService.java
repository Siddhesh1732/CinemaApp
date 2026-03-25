package com.project.cinema.service;


import com.project.cinema.dto.MovieResponse;
import com.project.cinema.models.*;
import com.project.cinema.repository.MovieRepository;
import com.project.cinema.repository.UserMovieListRepository;
import com.project.cinema.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final UserMovieListRepository userMovieListRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    // Scoring weights — tweak these to tune recommendations
    private static final int GENRE_SCORE       = 3;
    private static final int CAST_SCORE        = 2;
    private static final int LANGUAGE_SCORE    = 1;
    private static final int MIN_RATING        = 4; // only consider movies rated >= 4 as "liked"
    private static final int TOP_N             = 10; // how many recommendations to return

    // ── Helper: get currently logged-in user ──────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // ── Helper: convert Movie → MovieResponse (same as MovieService) ──────
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
                .genres(movie.getGenres().stream()
                        .map(Genre::getName).collect(Collectors.toList()))
                .castMembers(movie.getCastMembers().stream()
                        .map(CastMember::getName).collect(Collectors.toList()))
                .build();
    }

    // ── MAIN METHOD: GET /api/recommendations/me ───────────────────────────
    public List<MovieResponse> getRecommendations() {
        User user = getCurrentUser();
        log.info("Generating recommendations for user: {}", user.getUsername());

        // ── Step 1: Get all movies user rated >= MIN_RATING in WATCHED list ──
        List<UserMovieList> highlyRatedEntries = userMovieListRepository
                .findByUserAndListTypeAndRatingIsNotNull(user, UserMovieList.ListType.WATCHED)
                .stream()
                .filter(entry -> entry.getRating() != null && entry.getRating() >= MIN_RATING)
                .collect(Collectors.toList());

        log.debug("User has {} highly rated movies", highlyRatedEntries.size());

        // ── Step 2: Collect IDs of ALL movies already in any of user's lists ─
        // We exclude these from recommendations
        Set<Long> alreadyInListIds = new HashSet<>();
        for (UserMovieList.ListType listType : UserMovieList.ListType.values()) {
            userMovieListRepository
                    .findByUserAndListType(user, listType)
                    .forEach(entry -> alreadyInListIds.add(entry.getMovie().getId()));
        }

        log.debug("Excluding {} movies already in user's lists", alreadyInListIds.size());

        // ── Step 3: Fallback — if user has no highly rated movies ─────────────
        // Return top globally rated movies not already in their lists
        if (highlyRatedEntries.isEmpty()) {
            log.info("No highly rated movies found. Returning global top rated as fallback.");
            return movieRepository.findAll().stream()
                    .filter(m -> !alreadyInListIds.contains(m.getId()))
                    .sorted(Comparator.comparingDouble(Movie::getAverageRating).reversed())
                    .limit(TOP_N)
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        // ── Step 4: Build preference maps ─────────────────────────────────────
        // Genre preference: { "Sci-Fi" -> 5, "Thriller" -> 3, "Drama" -> 1 }
        // Higher count = user likes this genre more
        Map<String, Integer> genrePreference    = new HashMap<>();
        Map<String, Integer> castPreference     = new HashMap<>();
        Set<String>          languagePreference = new HashSet<>();

        for (UserMovieList entry : highlyRatedEntries) {
            Movie movie = entry.getMovie();

            // Weight by rating — a 5-star movie contributes more than a 4-star one
            int weight = entry.getRating() - MIN_RATING + 1; // e.g. rating=5 → weight=2, rating=4 → weight=1

            for (Genre genre : movie.getGenres()) {
                genrePreference.merge(genre.getName(), weight, Integer::sum);
            }
            for (CastMember cast : movie.getCastMembers()) {
                castPreference.merge(cast.getName(), weight, Integer::sum);
            }
            if (movie.getLanguage() != null) {
                languagePreference.add(movie.getLanguage());
            }
        }

        log.debug("Genre preferences: {}", genrePreference);
        log.debug("Cast preferences:  {}", castPreference);

        // ── Step 5: Score all remaining movies ────────────────────────────────
        List<Movie> candidateMovies = movieRepository.findAll().stream()
                .filter(m -> !alreadyInListIds.contains(m.getId()))
                .collect(Collectors.toList());

        Map<Movie, Integer> scoreMap = new HashMap<>();

        for (Movie candidate : candidateMovies) {
            int score = 0;

            // Genre scoring — each matching genre adds its preference weight * GENRE_SCORE
            for (Genre genre : candidate.getGenres()) {
                if (genrePreference.containsKey(genre.getName())) {
                    score += genrePreference.get(genre.getName()) * GENRE_SCORE;
                }
            }

            // Cast scoring — each matching cast member adds its preference weight * CAST_SCORE
            for (CastMember cast : candidate.getCastMembers()) {
                if (castPreference.containsKey(cast.getName())) {
                    score += castPreference.get(cast.getName()) * CAST_SCORE;
                }
            }

            // Language scoring — flat bonus if language matches any preferred language
            if (candidate.getLanguage() != null &&
                    languagePreference.contains(candidate.getLanguage())) {
                score += LANGUAGE_SCORE;
            }

            // Boost slightly by average rating so equally scored movies
            // prefer higher rated ones
            score += (int) (candidate.getAverageRating() * 0.5);

            scoreMap.put(candidate, score);
        }

        // ── Step 6: Sort by score and return top N ────────────────────────────
        List<MovieResponse> recommendations = scoreMap.entrySet().stream()
                .sorted(Map.Entry.<Movie, Integer>comparingByValue().reversed())
                .limit(TOP_N)
                .map(entry -> {
                    log.debug("Recommending '{}' with score {}",
                            entry.getKey().getTitle(), entry.getValue());
                    return toResponse(entry.getKey());
                })
                .collect(Collectors.toList());

        log.info("Generated {} recommendations for user: {}",
                recommendations.size(), user.getUsername());

        return recommendations;
    }
}
