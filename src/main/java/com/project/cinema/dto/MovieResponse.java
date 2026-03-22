package com.project.cinema.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MovieResponse {
    private Long id;
    private String title;
    private Integer releaseYear;
    private String description;
    private String posterUrl;
    private String trailerUrl;
    private String language;
    private String country;
    private Integer durationMinutes;
    private String status;
    private Integer averageRating;
    private Integer totalRatings;
    private List<String> genres;        // Just genre names, not full Genre objects
    private List<String> castMembers;   // Just cast names
}