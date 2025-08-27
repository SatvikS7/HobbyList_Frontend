package HobbyList.example.HobbyList.controller;

import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.dto.LoginRequest;
import HobbyList.example.HobbyList.dto.SignupRequest;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.service.JwtService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, 
                         PasswordEncoder passwordEncoder,
                         JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        // Encode password and save user
        User newUser = new User();
        newUser.setEmail(request.email());
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setRole("ROLE_USER");
        userRepository.save(newUser);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return userRepository.findByEmail(request.email())
            .filter(user -> passwordEncoder.matches(request.password(), user.getPassword()))
            .map(user -> {
                String token = jwtService.generateToken(user);
                return ResponseEntity.ok(Map.of("token", token));
            })
            .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                   .body(Map.of("error", "Invalid email or password")));
    }
}