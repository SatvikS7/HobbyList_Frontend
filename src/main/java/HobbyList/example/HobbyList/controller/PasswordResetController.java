package HobbyList.example.HobbyList.controller;

import HobbyList.example.HobbyList.model.token.VerificationToken;
import HobbyList.example.HobbyList.model.user.User;
import HobbyList.example.HobbyList.dto.ResetPasswordRequest;
import HobbyList.example.HobbyList.dto.ResetPassword;
import HobbyList.example.HobbyList.repository.token.TokenRepository;
import HobbyList.example.HobbyList.repository.user.UserRepository;
import HobbyList.example.HobbyList.service.JwtService;
import HobbyList.example.HobbyList.service.VerificationService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final VerificationService verificationService;

    public PasswordResetController(UserRepository userRepository, 
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

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.email());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User user = userOptional.get();
        verificationService.sendVerificationEmail(user.getId(), "PASSWORD_RESET");
        return ResponseEntity.ok(Map.of("message", "Password reset email sent successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPassword request, @RequestParam("token") String token) {
        Optional<VerificationToken> verificationToken = tokenRepository.findByToken(token);
        if (verificationToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }

        Long userId = verificationToken.get().getUserId();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        tokenRepository.delete(verificationToken.get());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
