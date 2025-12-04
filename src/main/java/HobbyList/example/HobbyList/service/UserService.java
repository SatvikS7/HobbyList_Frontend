package HobbyList.example.HobbyList.service;

import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.dto.PhotoDto;
import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.dto.UserSummaryDto;
import HobbyList.example.HobbyList.dto.UserSummaryProjection;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.UserRepository;
import org.springframework.stereotype.Service;
import HobbyList.example.HobbyList.repository.MilestoneRepository;
import HobbyList.example.HobbyList.repository.PhotoRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowService followService;
    private final S3Service s3Service;
    private final MilestoneRepository milestoneRepository;
    private final PhotoRepository photoRepository;
    private final MilestoneService milestoneService;
    private final PhotoService photoService;
    private final ObjectMapper objectMapper;
    // Assuming we might need mappers or other services to convert milestones/photos
    // For now, we'll assume basic conversion or empty lists if not visible

    public UserService(UserRepository userRepository, FollowService followService, S3Service s3Service,
            MilestoneRepository milestoneRepository, PhotoRepository photoRepository,
            MilestoneService milestoneService, PhotoService photoService, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.followService = followService;
        this.s3Service = s3Service;
        this.milestoneRepository = milestoneRepository;
        this.photoRepository = photoRepository;
        this.milestoneService = milestoneService;
        this.photoService = photoService;
        this.objectMapper = objectMapper;
    }

    private String getPresignUrl(String profileUrl) {
        if (profileUrl == null) {
            return null;
        }
        String bucketName = "hobbylist-photos";
        String key = profileUrl.substring(profileUrl.indexOf("profile/"));
        return s3Service.generateDownloadUrl(bucketName, key);
    }

    public ProfileDto getUserProfile(User requester, Long targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update to use relationship ?
        boolean isSelf = requester.getId() == target.getId();
        boolean isFollowing = followService.isFollowing(requester, target);
        boolean isPrivate = target.isPrivate();
        boolean isFollowRequested = followService.isFollowRequested(requester, target);

        boolean canViewContent = isSelf || !isPrivate || isFollowing;

        List<MilestoneDto> milestones = null;
        List<PhotoDto> photos = null;

        if (canViewContent && !isSelf) {
            milestones = milestoneRepository.findByUserId(targetUserId).stream()
                    .map(milestoneService::toDto)
                    .collect(Collectors.toList());

            photos = photoRepository.findByUserId(targetUserId).stream()
                    .map(photo -> photoService.toDto(photo, photo.getImageUrl()))
                    .toList();
        }

        String profileUrl = target.getProfileUrl();
        String presignedUrl = getPresignUrl(profileUrl);

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

    public List<UserSummaryDto> searchUsers(String query, Long currentUserId) {
        return userRepository.searchUsers(query, currentUserId).stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> getDiscoveryUsers(Long currentUserId) {
        return userRepository.findSuggestedUsers(currentUserId).stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    private UserSummaryDto convertToSummaryDto(UserSummaryProjection user) {
        List<String> hobbiesList = new ArrayList<>();

        try {
            if (user.getHobbies() != null) {
                hobbiesList = objectMapper.readValue(
                        user.getHobbies(),
                        new TypeReference<List<String>>() {
                        });
            }
        } catch (Exception e) {
            System.err.println("Error parsing hobbies for user " + user.getId() + ": " + e.getMessage());
        }

        return new UserSummaryDto(
                user.getId(),
                user.getDisplayName(),
                getPresignUrl(user.getProfileUrl()),
                hobbiesList,
                user.getRelationship());
    }
}
