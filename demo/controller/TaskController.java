package com.example.demo.controller;

import com.example.demo.JwtUtil;
import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * Handles CRUD for tasks.
 * Users must send Authorization header: "Bearer <token>"
 */
@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepo;

    @Autowired
    private JwtUtil jwtUtil;

    // Helper to extract username from token
    private String getUsername(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = header.substring(7);
        return jwtUtil.extractUsername(token);
    }

    // GET all tasks for logged-in user
    @GetMapping
    public List<Task> getTasks(HttpServletRequest request) {
        String username = getUsername(request);
        return taskRepo.findByUsername(username);
    }

    // POST create new task
    @PostMapping
    public String addTask(@RequestBody Task task, HttpServletRequest request) {
        String username = getUsername(request);
        task.setUsername(username);
        taskRepo.save(task);
        return "Task added for user: " + username;
    }
}
