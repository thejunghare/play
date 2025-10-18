package com.example.demo;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

/**
 * Creates and verifies JWT tokens.
 * Think of this as a 'signature service' for logins.
 */
@Component
public class JwtUtil {

  private final Key key;

  public JwtUtil(@Value("${app.jwt.secret}") String secret) {
    // The secret must be at least 32 characters (for HS256)
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
  }

  // Create token with username inside it
  public String generateToken(String username) {
    return Jwts.builder()
        .setSubject(username) // store username inside token
        .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // valid for 1 hour
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  // Validate token and extract username
  public String extractUsername(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
  }
}
