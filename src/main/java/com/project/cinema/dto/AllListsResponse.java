package com.project.cinema.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AllListsResponse {
    private List<UserMovieListResponse> watched;
    private List<UserMovieListResponse> watchlist;
    private List<UserMovieListResponse> liked;
}