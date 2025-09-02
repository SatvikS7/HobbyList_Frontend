package HobbyList.example.HobbyList.repository;

import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    // Find all photos by a specific user
    List<Photo> findByUser(User user);

    // Find all photos by user ID
    List<Photo> findByUserId(Long userId);

    // Find all photos for a user under a specific topic
    List<Photo> findByUserIdAndTopic(Long userId, String topic);
}
