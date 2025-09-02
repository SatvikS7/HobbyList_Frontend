package HobbyList.example.HobbyList.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import HobbyList.example.HobbyList.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);
}