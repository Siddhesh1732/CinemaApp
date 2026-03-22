package com.project.cinema.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserMovieListResponse {
    private Long id;
    private String listType;
    private Integer rating;
    private String review;
    private LocalDateTime addedAt;

    // Embedded movie info — no need to call /api/movies separately
    private Long movieId;
    private String movieTitle;
    private Integer movieReleaseYear;
    private String moviePosterUrl;
    private Integer movieAverageRating;
}
