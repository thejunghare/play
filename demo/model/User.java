package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a user account in our database.
 * Lombok annotations:
 * - @Getter/@Setter: auto-generate getter/setter methods
 * - @NoArgsConstructor/@AllArgsConstructor: generate constructors
 * - @Builder: allows building user objects easily (optional sugar)
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true)
  private String username;

  private String password;
}
