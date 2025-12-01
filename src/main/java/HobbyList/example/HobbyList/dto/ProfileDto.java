package HobbyList.example.HobbyList.dto;

import java.util.ArrayList;
import java.util.List;

public record ProfileDto(
                long id,
                String displayName,
                String profileURL,
                String description,
                ArrayList<String> hobbies,
                Boolean isPrivate,
                int followersCount,
                int followingCount,
                boolean isFollowing,
                boolean isFollowRequested,
                List<MilestoneDto> milestones,
                List<PhotoDto> photos) {
        /*
         * public ProfileDto(long id, String displayName, String profileURL, String
         * description, Boolean isPrivate, ArrayList<String> hobbies, int
         * followersCount, int followingCount, boolean isFollowing, boolean
         * isFollowRequested, List<MilestoneDto> milestones, List<PhotoDto> photos) {
         * this.id = id;
         * this.displayName = displayName;
         * this.profileURL = profileURL;
         * this.description = description;
         * this.isPrivate = isPrivate;
         * this.hobbies = hobbies;
         * this.followersCount = followersCount;
         * this.followingCount = followingCount;
         * this.isFollowing = isFollowing;
         * this.isFollowRequested = isFollowRequested;
         * this.milestones = milestones;
         * this.photos = photos;
         * }
         */
}
