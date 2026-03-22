package com.project.cinema.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToListRequest {

    @NotNull
    private Long movieId;

    @NotNull
    private String listType;   // "WATCHED", "WATCHLIST", "LIKED"
}