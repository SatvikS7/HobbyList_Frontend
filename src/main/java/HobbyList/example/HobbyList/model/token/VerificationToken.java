package HobbyList.example.HobbyList.model.token;

import java.time.LocalDateTime;

import lombok.Data;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

@Entity
@Table(name = "verification_tokens")
@Data
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @Column(nullable = false, name = "user_id")
    private Long userId;

    private LocalDateTime expiryDate;

    public VerificationToken() {}

    public VerificationToken(String token, Long userId) {
        this.token = token;
        this.userId = userId;
        this.expiryDate = LocalDateTime.now().plusHours(24);
    }
}
