package HobbyList.example.HobbyList.dto;
import java.util.ArrayList;

public record ProfileDto(
        String profileURL,
        String description,
        String displayName,
        Boolean isPrivate,
        ArrayList<String> hobbies
) {
    public ProfileDto(String profileURL, String description, String displayName, Boolean isPrivate, ArrayList<String> hobbies) {
        this.profileURL = profileURL;
        this.description = description;
        this.displayName = displayName;
        this.isPrivate = isPrivate;
        this.hobbies = hobbies;
    }
}
