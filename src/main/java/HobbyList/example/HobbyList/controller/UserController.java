package HobbyList.example.HobbyList.controller;

import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.dto.UserSummaryDto;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryDto>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @GetMapping("/discover")
    public ResponseEntity<List<UserSummaryDto>> discoverUsers(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<UserSummaryDto> discoveryUsers = userService.getDiscoveryUsers(user.getId());
        return ResponseEntity.ok(discoveryUsers);
    }
}
