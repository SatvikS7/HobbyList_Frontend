package HobbyList.example.HobbyList.model;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "milestones")
@Data
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String task;

    @Column(nullable = false)
    private LocalDateTime dateCreated;

    @Column(nullable = true)
    private OffsetDateTime dueDate;

    @Column(nullable = false)
    private boolean completed = false;

    @Column(nullable = false)
    private Double completionRate = 0.0;

    @Column(nullable = false)
    private String manualState = "none";

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Milestone parent;

    private int depth;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Milestone> subMilestones = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToMany
    @JoinTable(
        name = "milestone_photos",
        joinColumns = @JoinColumn(name = "milestone_id"),
        inverseJoinColumns = @JoinColumn(name = "photo_id")
    )
    private List<Photo> taggedPhotos;

    private String hobbyTag;

    public Milestone() {
    }

    public Milestone(String task, LocalDateTime dateCreated, int depth, User user) {
        this.task = task;
        this.dateCreated = dateCreated;
        this.completed = false;
        this.depth = depth;
        this.user = user;
    }
}
