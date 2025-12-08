package HobbyList.example.HobbyList.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "follow_requests")
@Data
@NoArgsConstructor
public class FollowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne
    @JoinColumn(name = "target_id", nullable = false)
    private User target;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum RequestStatus {
        PENDING,
        REJECTED,
        ACCEPTED
    }

    public FollowRequest(User requester, User target) {
        this.requester = requester;
        this.target = target;
        this.status = RequestStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }
}
