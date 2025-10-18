package com.example.demo.controller;

import com.example.demo.JwtUtil;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Handles user signup and login.
 */
@RestController
public class AuthController {

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private JwtUtil jwtUtil;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  // 1️⃣ Register a new user
  @PostMapping("/register")
  public String register(@RequestBody User user) {
    user.setPassword(passwordEncoder.encode(user.getPassword())); // encrypt password
    userRepo.save(user);
    return "User registered successfully!";
  }

  // 2️⃣ Login user
  @PostMapping("/login")
  public String login(@RequestBody User user) {
    var dbUser = userRepo.findByUsername(user.getUsername())
        .orElseThrow(() -> new RuntimeException("User not found!"));

    // Compare raw vs hashed password
    if (passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
      return jwtUtil.generateToken(user.getUsername());
    } else {
      return "Invalid password.";
    }
  }
}
