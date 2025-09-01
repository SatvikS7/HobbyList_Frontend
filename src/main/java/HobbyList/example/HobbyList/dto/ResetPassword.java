package HobbyList.example.HobbyList.dto;
import jakarta.validation.constraints.NotBlank;

public record ResetPassword(

    @NotBlank(message = "Password is required")
    String password
) {}
