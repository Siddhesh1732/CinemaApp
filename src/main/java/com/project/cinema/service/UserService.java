package com.project.cinema.service;

import com.project.cinema.dto.UpdateProfileRequest;
import com.project.cinema.dto.UserResponse;
import com.project.cinema.models.User;
import com.project.cinema.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // ── Helper: get currently logged-in user from SecurityContext ──────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName(); // Returns email (we set this in JwtAuthFilter)
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // ── Helper: convert User entity → UserResponse DTO ────────────────────
    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ── GET /api/users/me ──────────────────────────────────────────────────
    public UserResponse getMyProfile() {
        return toResponse(getCurrentUser());
    }

    // ── PUT /api/users/me ──────────────────────────────────────────────────
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        // Only update fields that were actually sent (null check)
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        userRepository.save(user);
        return toResponse(user);
    }

    // ── GET /api/users/{username} ──────────────────────────────────────────
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return toResponse(user);
    }

    // ── GET /api/users/search?q=john ──────────────────────────────────────
    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}

