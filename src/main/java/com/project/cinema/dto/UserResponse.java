package com.project.cinema.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String profilePictureUrl;
    private LocalDateTime createdAt;
    // Notice: NO password, NO role, NO isActive — never expose these
}
