package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Each task belongs to a specific username (the one inside their JWT token).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private boolean completed;

    // Which user owns this task
    private String username;
}
