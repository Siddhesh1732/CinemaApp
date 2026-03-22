package com.project.cinema.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CastMemberResponse {
    private Long id;
    private String name;
    private String primaryRole;
    private LocalDate dateOfBirth;
    private String nationality;
    private String profilePictureUrl;
    private String biography;
}
