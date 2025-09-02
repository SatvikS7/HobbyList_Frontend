package HobbyList.example.HobbyList.model;

import java.time.LocalDateTime;

import lombok.Data;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;

@Entity
@Table(name = "verification_tokens")
@Data
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type;

    private LocalDateTime expiryDate;

    public VerificationToken() {}

    public VerificationToken(String token, User user, String type) {
        this.token = token;
        this.user = user;
        this.type = type;
        this.expiryDate = LocalDateTime.now().plusHours(24);
    }
}
