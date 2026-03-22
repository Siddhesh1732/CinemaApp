package com.project.cinema.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "genres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;  // e.g., "Action", "Drama", "Comedy", "Sci-Fi"

    @Column(length = 200)
    private String description;  // Optional short description of the genre

    // --- Relationships ---

    @ManyToMany(mappedBy = "genres")
    @Builder.Default
    private List<Movie> movies = new ArrayList<>();

    // Why a separate table instead of an Enum?
    // Because new genres can be added by an admin without code changes.
    // If we used an Enum, adding "Docuseries" would require redeployment.
}
