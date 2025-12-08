package HobbyList.example.HobbyList.dto;

import HobbyList.example.HobbyList.model.User;

public record VerificationEmailEvent(User user, String type) {}