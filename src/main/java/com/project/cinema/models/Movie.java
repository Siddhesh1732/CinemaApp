package com.project.cinema.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private Integer releaseYear;

    @Column(columnDefinition = "TEXT")
    private String description;  // Plot summary / synopsis

    @Column(name = "poster_url")
    private String posterUrl;  // Link to movie poster image

    @Column(name = "trailer_url")
    private String trailerUrl;  // YouTube or other trailer link

    @Column(length = 50)
    private String language;  // e.g., "English", "Hindi", "Korean"

    @Column(length = 50)
    private String country;  // Country of origin

    @Column(name = "duration_minutes")
    private Integer durationMinutes;  // Runtime in minutes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MovieStatus status = MovieStatus.RELEASED;

    // Calculated field — updated periodically based on UserMovieList ratings
    // Stored in DB for performance instead of computing on every query
    @Column(name = "average_rating")
    @Builder.Default
    private Integer averageRating = 0;

    @Column(name = "total_ratings")
    @Builder.Default
    private Integer totalRatings = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // --- Relationships ---

    // A movie can have multiple cast members; a cast member can be in many movies
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "movie_cast",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "cast_member_id")
    )
    @Builder.Default
    private List<CastMember> castMembers = new ArrayList<>();

    // A movie can belong to multiple genres
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "movie_genre",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private List<Genre> genres = new ArrayList<>();

    // All user interactions with this movie (watched, liked, watchlist)
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserMovieList> userMovieLists = new ArrayList<>();

    public enum MovieStatus {
        RELEASED,
        UPCOMING,
        IN_PRODUCTION
    }
}
