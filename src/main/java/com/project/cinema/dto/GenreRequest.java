package com.project.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenreRequest {

    @NotBlank
    @Size(max = 50)
    private String name;

    @Size(max = 200)
    private String description;
}
