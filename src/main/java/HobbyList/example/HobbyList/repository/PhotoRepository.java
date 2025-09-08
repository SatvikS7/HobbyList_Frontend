package HobbyList.example.HobbyList.repository;

import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    // Find all photos by user ID
    List<Photo> findByUserId(Long userId);

    // Find all photos for a user under a specific topic
    List<Photo> findByUserIdAndTopic(Long userId, String topic);

    // Find the profile picture for a user
    Optional<Photo> findByUserIdAndIsProfileTrue(Long userId);

    // Find all non-profile photos for a user
    List<Photo> findByUserIdAndIsProfileFalse(Long userId);
}
