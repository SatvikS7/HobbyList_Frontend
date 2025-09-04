package HobbyList.example.HobbyList.service;

import java.util.UUID;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.model.VerificationToken;
import HobbyList.example.HobbyList.repository.TokenRepository;

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

    public void sendVerificationEmail(User user, String type) {
        // Generate verification token
        String token = UUID.randomUUID().toString();

        VerificationToken verificationToken = new VerificationToken(token, user, type);
        tokenRepository.save(verificationToken);
        String compositeUrl = "";

        if(type.equals("EMAIL_VERIFICATION")) {
            compositeUrl = frontendUrl + "verification?token=" + token;
        } else if(type.equals("PASSWORD_RESET")) {
            compositeUrl = frontendUrl + "reset-password?token=" + token;
        }

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());

        if(type.equals("EMAIL_VERIFICATION")) {
            mail.setSubject("Verify your email");
            mail.setText("Click the link to verify your account: " + compositeUrl);
        } else if(type.equals("PASSWORD_RESET")) {
            mail.setSubject("Reset your password");
            mail.setText("Click the link to reset your password: " + compositeUrl);
        }
        mailSender.send(mail);
    }
    
}
