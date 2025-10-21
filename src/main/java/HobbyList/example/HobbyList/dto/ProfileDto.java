package HobbyList.example.HobbyList.dto;

public record ProfileDto(
        String profileURL,
        String description,
        String username
) {
    public ProfileDto(String profileURL, String description, String username) {
        this.profileURL = profileURL;
        this.description = description;
        this.username = username;
    }
}
