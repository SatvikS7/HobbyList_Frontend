package HobbyList.example.HobbyList.service;

import HobbyList.example.HobbyList.dto.UserSummaryDto;
import HobbyList.example.HobbyList.model.FollowRequest;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.FollowRequestRepository;
import HobbyList.example.HobbyList.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final UserRepository userRepository;
    private final FollowRequestRepository followRequestRepository;

    public FollowService(UserRepository userRepository, FollowRequestRepository followRequestRepository) {
        this.userRepository = userRepository;
        this.followRequestRepository = followRequestRepository;
    }

    @Transactional
    public void followUser(User requester, User target) {
        if (requester.getId() == target.getId()) {
            throw new IllegalArgumentException("You cannot follow yourself.");
        }

        if (isFollowing(requester, target)) {
            throw new IllegalStateException("You are already following this user.");
        }

        if (target.isPrivate()) {
            // Check if request already exists
            Optional<FollowRequest> existingRequest = followRequestRepository.findByRequesterAndTarget(requester,
                    target);
            if (existingRequest.isPresent()
                    && existingRequest.get().getStatus() == FollowRequest.RequestStatus.PENDING) {
                throw new IllegalStateException("Follow request already pending.");
            }

            // Create follow request
            FollowRequest request = new FollowRequest(requester, target);
            followRequestRepository.save(request);
        } else {
            // Direct follow
            target.getFollowers().add(requester);
            requester.getFollowing().add(target);
            userRepository.save(target);
            userRepository.save(requester);
        }
    }

    @Transactional
    public void unfollowUser(User requester, User target) {
        if (isFollowing(requester, target)) {
            target.getFollowers().remove(requester);
            requester.getFollowing().remove(target);
            userRepository.save(target);
            userRepository.save(requester);
        } else {
            // Check if there is a pending request to cancel
            Optional<FollowRequest> existingRequest = followRequestRepository.findByRequesterAndTarget(requester,
                    target);
            if (existingRequest.isPresent()
                    && existingRequest.get().getStatus() == FollowRequest.RequestStatus.PENDING) {
                followRequestRepository.delete(existingRequest.get());
            }
        }
    }

    @Transactional
    public void acceptRequest(Long requestId, User target) {
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getTarget().getId() != target.getId()) {
            throw new IllegalStateException("Not authorized to accept this request");
        }

        if (request.getStatus() != FollowRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not pending");
        }

        request.setStatus(FollowRequest.RequestStatus.ACCEPTED);
        followRequestRepository.save(request);

        User requester = request.getRequester();
        target.getFollowers().add(requester);
        requester.getFollowing().add(target);

        userRepository.save(target);
        userRepository.save(requester);
    }

    @Transactional
    public void rejectRequest(Long requestId, User target) {
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getTarget().getId() != target.getId()) {
            throw new IllegalStateException("Not authorized to reject this request");
        }

        request.setStatus(FollowRequest.RequestStatus.REJECTED);
        followRequestRepository.save(request);
    }

    public boolean isFollowing(User requester, User target) {
        return target.getFollowers().contains(requester);
    }

    public boolean isFollowRequested(User requester, User target) {
        Optional<FollowRequest> request = followRequestRepository.findByRequesterAndTarget(requester, target);
        return request.isPresent() && request.get().getStatus() == FollowRequest.RequestStatus.PENDING;
    }

    public List<UserSummaryDto> getFollowers(User user) {
        return user.getFollowers().stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> getFollowing(User user) {
        return user.getFollowing().stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<FollowRequest> getPendingRequests(User target) {
        return followRequestRepository.findByTargetAndStatus(target, FollowRequest.RequestStatus.PENDING);
    }

    private UserSummaryDto convertToSummaryDto(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getDisplayName(),
                user.getProfileURL());
    }
}
