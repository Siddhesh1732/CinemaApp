package com.project.cinema.dto;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MovieReviewResponse {
    private Long   userId;
    private String username;
    private String profilePictureUrl;
    private Integer rating;
    private String review;
    private LocalDateTime addedAt;
}
