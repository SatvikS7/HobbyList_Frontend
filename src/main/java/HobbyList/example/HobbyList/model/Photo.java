package HobbyList.example.HobbyList.model;

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

    @ManyToOne
    @PrimaryKeyJoinColumn
    private User user;

    public Photo(String topic, String imageUrl, User user) {
        this.topic = topic;
        this.imageUrl = imageUrl;
        this.user = user;
    }
}