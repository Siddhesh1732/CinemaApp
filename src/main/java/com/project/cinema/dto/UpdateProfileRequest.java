package com.project.cinema.dto;


import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 255)
    private String bio;

    private String profilePictureUrl;

    // Username and email changes can be added later
    // (they need extra checks like "is new email already taken")
    // Keep it simple for now
}
