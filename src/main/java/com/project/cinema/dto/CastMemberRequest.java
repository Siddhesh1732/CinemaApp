package com.project.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CastMemberRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    private String primaryRole;     // "ACTOR", "DIRECTOR", "WRITER", etc.

    private LocalDate dateOfBirth;
    private String nationality;
    private String profilePictureUrl;
    private String biography;
}