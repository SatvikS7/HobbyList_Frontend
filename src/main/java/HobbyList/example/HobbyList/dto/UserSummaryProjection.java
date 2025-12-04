package HobbyList.example.HobbyList.dto;

import java.util.List;

public interface UserSummaryProjection {
    Long getId();

    String getDisplayName();

    String getProfileUrl();

    String getHobbies();

    String getRelationship();
}
