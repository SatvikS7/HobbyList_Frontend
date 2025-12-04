package HobbyList.example.HobbyList.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.dto.UserSummaryProjection;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query(value = """
            SELECT
            u.id AS id,
            u.display_name AS displayName,
            u.profile_url AS profileUrl,
            u.hobbies::jsonb AS hobbies,

            CASE
                WHEN uf.follower_id IS NOT NULL THEN 'FOLLOWING'
                WHEN fr.id IS NOT NULL THEN 'REQUESTED'
                ELSE 'NONE'
            END AS relationship

            FROM users u

            LEFT JOIN user_followers uf
            ON uf.user_id = u.id
            AND uf.follower_id = :currentUserId

            LEFT JOIN follow_requests fr
            ON fr.requester_id = :currentUserId
            AND fr.target_id = u.id
            AND fr.status = 'PENDING'

            WHERE LOWER(u.display_name) LIKE LOWER(CONCAT('%', :query, '%'))
            AND u.id != :currentUserId

            ORDER BY u.display_name ASC
            """, nativeQuery = true)
    List<UserSummaryProjection> searchUsers(
            @Param("query") String query,
            @Param("currentUserId") Long currentUserId);

    @Query(value = "SELECT * FROM users u WHERE u.id != :currentUserId AND u.id NOT IN (SELECT uf.user_id FROM user_followers uf WHERE uf.follower_id = :currentUserId) ORDER BY RANDOM() LIMIT 10", nativeQuery = true)
    List<User> findRandomUsersNotFollowedBy(@Param("currentUserId") Long currentUserId);

    @Query(value = """
            SELECT
              u.id AS id,
              u.display_name AS displayName,
              u.profile_url AS profileUrl,
              u.hobbies::jsonb AS hobbies,

              CASE
                WHEN uf.follower_id IS NOT NULL THEN 'FOLLOWING'
                WHEN fr.id IS NOT NULL THEN 'REQUESTED'
                ELSE 'NONE'
              END AS relationship

            FROM users u

            LEFT JOIN user_followers uf
              ON uf.user_id = u.id
             AND uf.follower_id = :currentUserId

            LEFT JOIN follow_requests fr
              ON fr.requester_id = :currentUserId
             AND fr.target_id = u.id
             AND fr.status = 'PENDING'

            WHERE u.id != :currentUserId

            ORDER BY RANDOM()
            LIMIT 10
            """, nativeQuery = true)
    List<UserSummaryProjection> findSuggestedUsers(
            @Param("currentUserId") Long currentUserId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.photos WHERE u.email = :email")
    Optional<User> findUserWithPhotosByEmail(@Param("email") String email);

    @Query(value = """
                SELECT
                u.id AS id,
                u.display_name AS displayName,
                u.profile_url AS profileUrl,
                u.hobbies::jsonb AS hobbies,
                CASE
                    WHEN uf.follower_id IS NOT NULL THEN 'FOLLOWING'
                    WHEN fr.id IS NOT NULL THEN 'REQUESTED'
                    ELSE 'NONE'
                END AS relationship
                FROM user_followers f
                JOIN users u ON u.id = f.follower_id
                LEFT JOIN user_followers uf ON uf.user_id = u.id AND uf.follower_id = :currentUserId
                LEFT JOIN follow_requests fr ON fr.requester_id = :currentUserId AND fr.target_id = u.id AND fr.status = 'PENDING'
                WHERE f.user_id = :targetUserId
            """, nativeQuery = true)
    List<UserSummaryProjection> findFollowers(@Param("targetUserId") Long targetUserId,
            @Param("currentUserId") Long currentUserId);

    @Query(value = """
                SELECT
                u.id AS id,
                u.display_name AS displayName,
                u.profile_url AS profileUrl,
                u.hobbies::jsonb AS hobbies
                FROM follow_requests fr
                JOIN users u ON u.id = fr.requester_id
                WHERE fr.target_id = :targetUserId
                AND fr.status = 'PENDING'
            """, nativeQuery = true)
    List<UserSummaryProjection> findPendingRequests(@Param("targetUserId") Long targetUserId);

    @Query(value = """
                SELECT
                u.id AS id,
                u.display_name AS displayName,
                u.profile_url AS profileUrl,
                u.hobbies::jsonb AS hobbies,
                CASE
                    WHEN uf.follower_id IS NOT NULL THEN 'FOLLOWING'
                    WHEN fr.id IS NOT NULL THEN 'REQUESTED'
                    ELSE 'NONE'
                END AS relationship
                FROM user_followers f
                JOIN users u ON u.id = f.user_id
                LEFT JOIN user_followers uf ON uf.user_id = u.id AND uf.follower_id = :currentUserId
                LEFT JOIN follow_requests fr ON fr.requester_id = :currentUserId AND fr.target_id = u.id AND fr.status = 'PENDING'
                WHERE f.follower_id = :userId
            """, nativeQuery = true)
    List<UserSummaryProjection> findFollowing(@Param("userId") Long userId,
            @Param("currentUserId") Long currentUserId);

}