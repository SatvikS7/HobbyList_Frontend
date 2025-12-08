package HobbyList.example.HobbyList.dto;

import java.util.List;

public record ProfileDto(
                long id,
                String displayName,
                String profileUrl,
                String description,
                List<String> hobbies,
                Boolean isPrivate,
                int followersCount,
                int followingCount,
                boolean isFollowing,
                boolean isFollowRequested,
                List<MilestoneDto> milestones,
                List<PhotoDto> photos) 
{}
