package com.project.cinema.repository;

import com.project.cinema.models.Movie;
import com.project.cinema.models.User;
import com.project.cinema.models.UserMovieList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMovieListRepository extends JpaRepository<UserMovieList, Long> {
    // Check if entry already exists — used to prevent duplicates
    boolean existsByUserAndMovieAndListType(User user, Movie movie, UserMovieList.ListType listType);

    // Fetch specific entry — used for delete and rate
    Optional<UserMovieList> findByUserAndMovieAndListType(User user, Movie movie, UserMovieList.ListType listType);

    // Fetch all entries for a user's specific list
    List<UserMovieList> findByUserAndListType(User user, UserMovieList.ListType listType);

    // Fetch all rated entries for a movie — used for average rating calculation
    List<UserMovieList> findByMovieAndListTypeAndRatingIsNotNull(Movie movie, UserMovieList.ListType listType);

}
