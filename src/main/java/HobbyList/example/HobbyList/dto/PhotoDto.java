package HobbyList.example.HobbyList.dto;

import java.time.LocalDateTime;

public record PhotoDto(
    String topic,
    String imageUrl,
    String filename,
    Long size,
    String contentType,
    String description,
    LocalDateTime uploadDate
) {
    public PhotoDto(String topic, String imageUrl, String description, LocalDateTime uploadDate) {
        this(topic, imageUrl, null, null, null, description, uploadDate);
    }
}