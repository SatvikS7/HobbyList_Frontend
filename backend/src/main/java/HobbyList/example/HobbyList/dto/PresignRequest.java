package HobbyList.example.HobbyList.dto;

public record PresignRequest(
    String filename, 
    String contentType
) {}