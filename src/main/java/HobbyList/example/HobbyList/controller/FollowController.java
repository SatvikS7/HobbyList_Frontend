package HobbyList.example.HobbyList.controller;

import HobbyList.example.HobbyList.dto.UserSummaryDto;
import HobbyList.example.HobbyList.model.FollowRequest;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class FollowController {

    private final FollowService followService;
    private final UserRepository userRepository;

    public FollowController(FollowService followService, UserRepository userRepository) {
        this.followService = followService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<String> followUser(@PathVariable Long id, Authentication authentication) {
        User requester = userRepository.findByEmail(authentication.getName()).orElseThrow();
        User target = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        try {
            followService.followUser(requester, target);
            return ResponseEntity.ok("Follow action successful");
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/unfollow")
    public ResponseEntity<String> unfollowUser(@PathVariable Long id, Authentication authentication) {
        User requester = userRepository.findByEmail(authentication.getName()).orElseThrow();
        User target = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        followService.unfollowUser(requester, target);
        return ResponseEntity.ok("Unfollowed successfully");
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<UserSummaryDto>> getFollowers(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(followService.getFollowers(user));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<UserSummaryDto>> getFollowing(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(followService.getFollowing(user));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FollowRequest>> getPendingRequests(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(followService.getPendingRequests(user));
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<String> acceptRequest(@PathVariable Long requestId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        try {
            followService.acceptRequest(requestId, user);
            return ResponseEntity.ok("Request accepted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<String> rejectRequest(@PathVariable Long requestId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        try {
            followService.rejectRequest(requestId, user);
            return ResponseEntity.ok("Request rejected");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
