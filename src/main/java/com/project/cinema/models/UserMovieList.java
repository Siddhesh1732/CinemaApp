package com.project.cinema.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_movie_list",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_movie_listtype",
                columnNames = {"user_id", "movie_id", "list_type"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMovieList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Enumerated(EnumType.STRING)
    @Column(name = "list_type", nullable = false, length = 20)
    private ListType listType;

    // Rating is only meaningful for WATCHED list
    // Stored as 1-10 scale (null if not rated yet)
    @Min(1)
    @Max(5)
    @Column(name = "rating")
    private Integer rating;

    // Optional personal review/note
    @Column(name = "review", columnDefinition = "TEXT")
    private String review;

    // Useful for sorting "recently watched" or "recently added to watchlist"
    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // The three list types. Add more here later (e.g., FAVORITE, REWATCHED)
    // without any schema change — just add a new enum constant.
    public enum ListType {
        WATCHED,
        WATCHLIST,
        LIKED
    }
}
