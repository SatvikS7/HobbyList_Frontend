package HobbyList.example.HobbyList.service;

import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.dto.PhotoDto;
import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.dto.UserSummaryDto;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.UserRepository;
import org.springframework.stereotype.Service;
import HobbyList.example.HobbyList.service.S3Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowService followService;
    private final S3Service s3Service;
    // Assuming we might need mappers or other services to convert milestones/photos
    // For now, we'll assume basic conversion or empty lists if not visible

    public UserService(UserRepository userRepository, FollowService followService, S3Service s3Service) {
        this.userRepository = userRepository;
        this.followService = followService;
        this.s3Service = s3Service;
    }

    private String getPresignURL(String profileURL) {
        if (profileURL == null) {
            return null;
        }
        String bucketName = "hobbylist-photos";
        String key = profileURL.substring(profileURL.indexOf("profile/"));
        return s3Service.generateDownloadUrl(bucketName, key);
    }

    public ProfileDto getUserProfile(User requester, Long targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isSelf = requester.getId() == target.getId();
        boolean isFollowing = followService.isFollowing(requester, target);
        boolean isPrivate = target.isPrivate();
        boolean isFollowRequested = followService.isFollowRequested(requester, target);

        boolean canViewContent = isSelf || !isPrivate || isFollowing;

        List<MilestoneDto> milestones = null;
        List<PhotoDto> photos = null;

        if (canViewContent) {
            // TODO: Fetch real milestones and photos using existing services or
            // repositories
            // For now, we return empty lists to indicate access is allowed, or null if not.
            // In a real implementation, we would inject MilestoneService/PhotoService here.
            milestones = Collections.emptyList();
            photos = Collections.emptyList();
        }

        String profileURL = target.getProfileURL();
        String presignedUrl = getPresignURL(profileURL);

        return new ProfileDto(
                target.getId(),
                target.getDisplayName(),
                presignedUrl,
                target.getDescription(),
                target.getHobbies(),
                target.isPrivate(),
                target.getFollowers().size(),
                target.getFollowing().size(),
                isFollowing,
                isFollowRequested,
                milestones,
                photos);
    }

    public List<UserSummaryDto> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query).stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> getDiscoveryUsers(Long currentUserId) {
        return userRepository.findRandomUsersNotFollowedBy(currentUserId).stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    private UserSummaryDto convertToSummaryDto(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getDisplayName(),
                getPresignURL(user.getProfileURL()),
                user.getHobbies());
    }
}
