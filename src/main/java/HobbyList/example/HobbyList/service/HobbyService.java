package HobbyList.example.HobbyList.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.UserRepository;

@Service
public class HobbyService {

    @Autowired
    private UserRepository userRepository;

    public void addHobbyToUser(User user, String hobby) {
        if (hobby == null || hobby.isBlank()) {
            return;
        }

        String normalized = hobby.trim().toLowerCase();

        if (!user.getHobbies().contains(normalized)) {
            user.getHobbies().add(normalized);
            userRepository.save(user);
        }
    }
}
