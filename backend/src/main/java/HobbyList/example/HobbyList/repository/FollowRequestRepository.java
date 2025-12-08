package HobbyList.example.HobbyList.repository;

import HobbyList.example.HobbyList.model.FollowRequest;
import HobbyList.example.HobbyList.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {
    List<FollowRequest> findByTargetAndStatus(User target, FollowRequest.RequestStatus status);

    Optional<FollowRequest> findByRequesterAndTarget(User requester, User target);
    Optional<FollowRequest> findByRequesterAndTargetAndStatus(User requester, User target, FollowRequest.RequestStatus status);
}
