package HobbyList.example.HobbyList.controller;

import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.model.VerificationToken;
import HobbyList.example.HobbyList.dto.LoginRequest;
import HobbyList.example.HobbyList.dto.SignupRequest;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.repository.TokenRepository;
import HobbyList.example.HobbyList.service.JwtService;
import HobbyList.example.HobbyList.service.VerificationService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final VerificationService verificationService;

    public AuthController(UserRepository userRepository, 
                         PasswordEncoder passwordEncoder,
                         JwtService jwtService,
                         TokenRepository tokenRepository,
                         VerificationService verificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.verificationService = verificationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        // Check if email already exists
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user != null) {
            if (user.isEnabled()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email in use"));
            } else {
                // Resend Email
                verificationService.sendVerificationEmail(user);
            }
        }

        // Encode password and save user
        User newUser = new User();
        newUser.setEmail(request.email());
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setRole("ROLE_USER");
        userRepository.save(newUser);
        /* 
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, newUser);
        tokenRepository.save(verificationToken);
        */

        verificationService.sendVerificationEmail(newUser/* , verificationToken*/);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                   .body(Map.of("error", "Invalid email or password"));
        }
        User user = optionalUser.get();
        if(!user.isActive()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Account not activated"));
        }

        if(!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password"));
        }
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of("token", token));    
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestParam("token") String token) {
        Optional<VerificationToken> verificationToken = tokenRepository.findByToken(token);

        if (verificationToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid verification token"));
        }

        User user = verificationToken.get().getUser();
        user.setActive(true);
        userRepository.save(user);

        tokenRepository.delete(verificationToken.get());
        return ResponseEntity.ok(Map.of("message", "Account verified successfully"));
    }
}