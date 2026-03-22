package com.project.cinema.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FriendshipResponse {
    private Long friendshipId;
    private String status;
    private LocalDateTime createdAt;

    // The OTHER person's details (not the logged-in user)
    private Long userId;
    private String username;
    private String profilePictureUrl;
}
