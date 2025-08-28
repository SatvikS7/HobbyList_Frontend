package HobbyList.example.HobbyList.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import HobbyList.example.HobbyList.model.VerificationToken;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.TokenRepository;

@Service
public class VerificationService {
    private final JavaMailSender mailSender;
    private final TokenRepository tokenRepository;

    public VerificationService(JavaMailSender mailSender, TokenRepository tokenRepository) {
        this.mailSender = mailSender;
        this.tokenRepository = tokenRepository;
    }

    public void sendVerificationEmail(User user) {
        // Generate verification token
        String token = UUID.randomUUID().toString();
        
        VerificationToken verificationToken = new VerificationToken(token, user);
        tokenRepository.save(verificationToken);

        String verificationUrl = "http://localhost:8080/api/auth/verify?token=" + token;

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject("Verify your email");
        mail.setText("Click the link to verify your account: " + verificationUrl);

        mailSender.send(mail);
    }
    
}
