package HobbyList.example.HobbyList.security;

public final class SecurityConstants {
    public static final String[] AUTH_WHITELIST = {
            "/api/auth/login",
            "/api/auth/signup",
            "/api/auth/verify",
            "/api/auth/request-password-reset",
            "/api/auth/reset-password",
            "/api/photos/upload-url",
            "/api/photos",
            "/api/profile",
            "/api/profile/upload-url",
            "/api/profile/save-url",
            "/api/profile/hobbies",
            "/api/milestones",
            "/api/milestones/**",
            "/api/milestones/no-photo",
            "/api/milestones/all",
            "/api/users/discover",
            "/api/users/search",
            
    };

    private SecurityConstants() {
    }
}