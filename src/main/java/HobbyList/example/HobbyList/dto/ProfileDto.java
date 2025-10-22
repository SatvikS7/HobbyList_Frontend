package HobbyList.example.HobbyList.dto;
import java.util.ArrayList;

public record ProfileDto(
        String profileURL,
        String description,
        String username,
        boolean isPrivate,
        ArrayList<String> hobbies
) {
    public ProfileDto(String profileURL, String description, String username, boolean isPrivate, ArrayList<String> hobbies) {
        this.profileURL = profileURL;
        this.description = description;
        this.username = username;
        this.isPrivate = isPrivate;
        this.hobbies = hobbies;
    }
}
