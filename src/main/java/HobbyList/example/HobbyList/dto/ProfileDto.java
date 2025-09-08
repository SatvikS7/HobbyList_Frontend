package HobbyList.example.HobbyList.dto;

public record ProfileDto(
        String profileURL,
        String description
) {
    public ProfileDto(String profileURL, String description) {
        this.profileURL = profileURL;
        this.description = description;
    }
}
