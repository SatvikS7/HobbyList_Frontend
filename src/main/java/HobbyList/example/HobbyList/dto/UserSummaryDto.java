package HobbyList.example.HobbyList.dto;

import java.util.List;

public record UserSummaryDto(
        long id,
        String displayName,
        String profileUrl,
        List<String> hobbies
) {}
