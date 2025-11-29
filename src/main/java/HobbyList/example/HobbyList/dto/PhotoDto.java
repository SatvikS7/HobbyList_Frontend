package HobbyList.example.HobbyList.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PhotoDto(
    Long id,
    String topic,
    String imageUrl,
    String filename,
    Long size,
    String contentType,
    String description,
    List<Long> taggedMilestoneIds,
    LocalDateTime uploadDate
) {
    public PhotoDto(Long id, String topic, String imageUrl, String description, LocalDateTime uploadDate) {
        this(id, topic, imageUrl, null, null, null, description, null, uploadDate);
    }

    public PhotoDto(Long id, String topic, String imageUrl, String description, LocalDateTime uploadDate, List<Long> taggedMilestoneIds) {
        this(id, topic, imageUrl, null, null, null, description, taggedMilestoneIds, uploadDate);
    }
}