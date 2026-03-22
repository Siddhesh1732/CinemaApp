package com.project.cinema.repository;

import com.project.cinema.models.Genre;
import com.project.cinema.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenreRepository extends JpaRepository<Genre, Long> {
    boolean existsByNameIgnoreCase(String name);
}
