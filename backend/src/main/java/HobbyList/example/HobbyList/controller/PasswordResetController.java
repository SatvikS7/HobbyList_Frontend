package HobbyList.example.HobbyList.controller;

import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.model.VerificationToken;
import HobbyList.example.HobbyList.dto.ResetPasswordRequest;
import HobbyList.example.HobbyList.dto.ResetPassword;
import HobbyList.example.HobbyList.repository.TokenRepository;
import HobbyList.example.HobbyList.repository.UserRepository;
import jakarta.validation.Valid;
import HobbyList.example.HobbyList.dto.VerificationEmailEvent;


import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.ApplicationEventPublisher;


import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenRepository tokenRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PasswordResetController(UserRepository userRepository, 
                         PasswordEncoder passwordEncoder,
                         TokenRepository tokenRepository,
                         ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenRepository = tokenRepository;
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.email());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User user = userOptional.get();
        eventPublisher.publishEvent(new VerificationEmailEvent(user, "PASSWORD_RESET"));
        return ResponseEntity.ok(Map.of("message", "Password reset email sent successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPassword request, @RequestParam("token") String token) {
        Optional<VerificationToken> verificationToken = tokenRepository.findByToken(token);
        if (verificationToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }

        User user = verificationToken.get().getUser();
        //User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        tokenRepository.delete(verificationToken.get());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
