package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Spring Data JPA gives you automatic CRUD methods.
 * You can also define custom ones like findByUsername().
 */
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);
}
