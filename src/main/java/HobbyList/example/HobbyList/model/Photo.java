package HobbyList.example.HobbyList.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "photos")
@Data
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String topic;
    private String imageUrl;
    private String description;
    private String filename;
    private LocalDateTime uploadDate;
    private Long size;
    private String contentType;
    private Boolean isActive = true;

    @ManyToOne
    @PrimaryKeyJoinColumn
    private User user;

    public Photo() {}

    public Photo(String topic, String imageUrl, User user, LocalDateTime uploadDate) {
        this.topic = topic;
        this.imageUrl = imageUrl;
        this.user = user;
        this.uploadDate = uploadDate;
    }
}