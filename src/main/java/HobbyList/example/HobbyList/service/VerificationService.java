package HobbyList.example.HobbyList.service;

import java.util.UUID;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import HobbyList.example.HobbyList.model.token.VerificationToken;
import HobbyList.example.HobbyList.model.user.User;
import HobbyList.example.HobbyList.repository.token.TokenRepository;

import org.springframework.beans.factory.annotation.Value;
@Service
public class VerificationService {
    private final JavaMailSender mailSender;
    private final TokenRepository tokenRepository;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    public VerificationService(JavaMailSender mailSender, TokenRepository tokenRepository) {
        this.mailSender = mailSender;
        this.tokenRepository = tokenRepository;
    }

    public void sendVerificationEmail(User user) {
        // Generate verification token
        String token = UUID.randomUUID().toString();
        
        VerificationToken verificationToken = new VerificationToken(token, user);
        tokenRepository.save(verificationToken);

        String verificationUrl = frontendUrl + "verification?token=" + token;

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject("Verify your email");
        mail.setText("Click the link to verify your account: " + verificationUrl);

        mailSender.send(mail);
    }
    
}
