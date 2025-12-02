package HobbyList.example.HobbyList.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import HobbyList.example.HobbyList.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByUsernameContainingIgnoreCase(String username);

    @Query(value = "SELECT * FROM users u WHERE u.id != :currentUserId AND u.id NOT IN (SELECT uf.user_id FROM user_followers uf WHERE uf.follower_id = :currentUserId) ORDER BY RANDOM() LIMIT 10", nativeQuery = true)
    List<User> findRandomUsersNotFollowedBy(@Param("currentUserId") Long currentUserId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.photos WHERE u.email = :email")
    Optional<User> findUserWithPhotosByEmail(@Param("email") String email);
}