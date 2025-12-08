package HobbyList.example.HobbyList.dto;

public interface UserSummaryProjection {
    Long getId();

    String getDisplayName();

    String getProfileUrl();

    String getHobbies();

    String getRelationship();
}
