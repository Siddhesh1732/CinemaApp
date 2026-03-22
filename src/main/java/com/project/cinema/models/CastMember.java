package com.project.cinema.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cast_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CastMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    // A person can be actor, director, writer, producer, etc.
    // Stored as a String enum — extensible without schema change
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CastRole primaryRole;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 50)
    private String nationality;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(columnDefinition = "TEXT")
    private String biography;

    // --- Relationships ---

    // All movies this person has been part of
    @ManyToMany(mappedBy = "castMembers")
    @Builder.Default
    private List<Movie> movies = new ArrayList<>();

    // Note: The "character name" or "specific role in that movie"
    // is stored in the MovieCastDetail entity (see below), not here.
    // This entity represents the PERSON, not their role in a specific movie.

    public enum CastRole {
        ACTOR,
        DIRECTOR,
        WRITER,
        PRODUCER,
        COMPOSER,       // Music
        CINEMATOGRAPHER
    }
}
