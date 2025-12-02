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
                List<PhotoDto> photos) 
{}
