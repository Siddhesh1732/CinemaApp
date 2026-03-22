package com.project.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MovieRequest {

    @NotBlank
    private String title;

    @NotNull
    private Integer releaseYear;

    private String description;
    private String posterUrl;
    private String trailerUrl;
    private String language;
    private String country;
    private Integer durationMinutes;
    private String status;          // "RELEASED", "UPCOMING", "IN_PRODUCTION"

    // IDs of genres to link (must already exist in genres table)
    private List<Long> genreIds;

    // IDs of cast members to link (must already exist in cast_members table)
    private List<Long> castMemberIds;
}