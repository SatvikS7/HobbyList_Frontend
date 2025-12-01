package HobbyList.example.HobbyList.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import HobbyList.example.HobbyList.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByUsernameContainingIgnoreCase(String username);

    @Query(value = "SELECT * FROM users ORDER BY RAND() LIMIT 10", nativeQuery = true)
    List<User> findRandomUsers();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.photos WHERE u.email = :email")
    Optional<User> findUserWithPhotosByEmail(String email);
}