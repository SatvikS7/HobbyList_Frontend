package HobbyList.example.HobbyList.model;

import java.time.LocalDateTime;
import java.util.List;

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
    private Boolean isProfile = false;

    @ManyToOne
    @PrimaryKeyJoinColumn
    private User user;

    @ManyToMany(mappedBy = "taggedPhotos")
    private List<Milestone> taggedMilestones;

    public Photo() {}

    public Photo(String topic, String imageUrl, User user, LocalDateTime uploadDate) {
        this.topic = topic;
        this.imageUrl = imageUrl;
        this.user = user;
        this.uploadDate = uploadDate;
    }

    public Photo(String imageUrl, User user, LocalDateTime uploadDate, String filename, Long size, String contentType) {
        this.imageUrl = imageUrl;
        this.user = user;
        this.uploadDate = uploadDate;
        this.filename = filename;
        this.size = size;
        this.contentType = contentType;
        this.description = null;    
        this.taggedMilestones = null;
        this.topic = "Profile Picture";
        this.isProfile = true;
    }
}