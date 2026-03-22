package com.project.cinema.service;

import com.project.cinema.dto.AddToListRequest;
import com.project.cinema.dto.AllListsResponse;
import com.project.cinema.dto.RateMovieRequest;
import com.project.cinema.dto.UserMovieListResponse;
import com.project.cinema.models.Movie;
import com.project.cinema.models.User;
import com.project.cinema.models.UserMovieList;
import com.project.cinema.repository.MovieRepository;
import com.project.cinema.repository.UserMovieListRepository;
import com.project.cinema.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserMovieListService {

    private final UserMovieListRepository userMovieListRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    // ── Helper: get currently logged-in user ───────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // ── Helper: convert entity → DTO ───────────────────────────────────────
    private UserMovieListResponse toResponse(UserMovieList entry) {
        return UserMovieListResponse.builder()
                .id(entry.getId())
                .listType(entry.getListType().name())
                .rating(entry.getRating())
                .review(entry.getReview())
                .addedAt(entry.getAddedAt())
                .movieId(entry.getMovie().getId())
                .movieTitle(entry.getMovie().getTitle())
                .movieReleaseYear(entry.getMovie().getReleaseYear())
                .moviePosterUrl(entry.getMovie().getPosterUrl())
                .movieAverageRating(entry.getMovie().getAverageRating())
                .build();
    }

    // ── POST /api/user-movies ──────────────────────────────────────────────
    public UserMovieListResponse addToList(AddToListRequest request) {
        User user = getCurrentUser();

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + request.getMovieId()));

        UserMovieList.ListType listType = UserMovieList.ListType.valueOf(request.getListType());

        // Check if this exact combo (user + movie + listType) already exists
        if (userMovieListRepository.existsByUserAndMovieAndListType(user, movie, listType)) {
            throw new RuntimeException("Movie already in " + request.getListType() + " list");
        }

        UserMovieList entry = UserMovieList.builder()
                .user(user)
                .movie(movie)
                .listType(listType)
                .build();

        return toResponse(userMovieListRepository.save(entry));
    }

    // ── DELETE /api/user-movies/{movieId}/{listType} ───────────────────────
    public void removeFromList(Long movieId, String listType) {
        User user = getCurrentUser();

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + movieId));

        UserMovieList entry = userMovieListRepository
                .findByUserAndMovieAndListType(user, movie, UserMovieList.ListType.valueOf(listType))
                .orElseThrow(() -> new RuntimeException("Movie not found in " + listType + " list"));

        userMovieListRepository.delete(entry);
    }

    // ── GET /api/user-movies/me/{listType} ────────────────────────────────
    public List<UserMovieListResponse> getMyList(String listType) {
        User user = getCurrentUser();

        return userMovieListRepository
                .findByUserAndListType(user, UserMovieList.ListType.valueOf(listType))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET /api/user-movies/me/all ────────────────────────────────────────
    public AllListsResponse getAllMyLists() {
        return AllListsResponse.builder()
                .watched(getMyList("WATCHED"))
                .watchlist(getMyList("WATCHLIST"))
                .liked(getMyList("LIKED"))
                .build();
    }

    // ── PUT /api/user-movies/{movieId}/rate ───────────────────────────────
    // Rating only makes sense for WATCHED list
    public UserMovieListResponse rateMovie(Long movieId, RateMovieRequest request) {
        User user = getCurrentUser();

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + movieId));

        // Can only rate if movie is in WATCHED list
        UserMovieList entry = userMovieListRepository
                .findByUserAndMovieAndListType(user, movie, UserMovieList.ListType.WATCHED)
                .orElseThrow(() -> new RuntimeException("Add movie to WATCHED list before rating"));

        entry.setRating(request.getRating());
        entry.setReview(request.getReview());

        userMovieListRepository.save(entry);

        // Recalculate and update movie's average rating
        updateMovieAverageRating(movie);

        return toResponse(entry);
    }

    // ── Helper: recalculate average rating for a movie ────────────────────
    // Called every time someone rates a movie
    private void updateMovieAverageRating(Movie movie) {

        // Fetch all ratings for this movie (only WATCHED entries with a rating)
        List<UserMovieList> ratedEntries = userMovieListRepository
                .findByMovieAndListTypeAndRatingIsNotNull(movie, UserMovieList.ListType.WATCHED);

        if (ratedEntries.isEmpty()) {
            movie.setAverageRating(0);
            movie.setTotalRatings(0);
        } else {
            int avg = (int) ratedEntries.stream()
                    .mapToInt(UserMovieList::getRating)
                    .average()
                    .orElse(0);

            // Round to 1 decimal: 7.333 → 7.3
            movie.setAverageRating(Math.round(avg * 5) / 5);
            movie.setTotalRatings(ratedEntries.size());
        }

        movieRepository.save(movie);
    }

    // ── View a FRIEND'S list (used by FriendshipService later) ────────────
    // Already written here so FriendshipService just calls this with a userId
    public List<UserMovieListResponse> getUserList(Long userId, String listType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return userMovieListRepository
                .findByUserAndListType(user, UserMovieList.ListType.valueOf(listType))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}