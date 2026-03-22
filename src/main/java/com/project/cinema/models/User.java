package com.project.cinema.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")  // "user" is a reserved keyword in SQL, so we use "users"
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;  // Will be stored as BCrypt hash, never plain text

    @Column(length = 255)
    private String bio;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;  // USER or ADMIN

//    @Column(name = "is_active")
//    @Builder.Default
//    private Boolean isActive = true;  // Useful for soft-deleting accounts

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- Relationships ---

    // One user can have many entries in their movie lists
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserMovieList> movieLists = new ArrayList<>();

    // Friendships where this user sent the request
    @OneToMany(mappedBy = "requester", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Friendship> sentRequests = new ArrayList<>();

    // Friendships where this user received the request
    @OneToMany(mappedBy = "addressee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Friendship> receivedRequests = new ArrayList<>();

    // Enum for user roles — extensible (e.g., add MODERATOR later)
    public enum Role {
        USER,
        ADMIN
    }
}

