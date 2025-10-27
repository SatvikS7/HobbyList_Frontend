package HobbyList.example.HobbyList.security;

public final class SecurityConstants {
    public static final String[] AUTH_WHITELIST = {
        "/api/auth/login",
        "/api/auth/signup",
        "/api/auth/verify",
        "/api/auth/request-password-reset",
        "/api/auth/reset-password",
        "/api/photos/get-upload-url",
        "/api/photos/save-url",
        "/api/photos",
        "/api/profile",
        "/api/profile/get-upload-url",
        "/api/profile/save-url",
        "/api/profile/update-profile",
        "/api/milestones",
        "/api/milestones/create-milestone",
        "/api/milestones/delete-milestone/**",
        "/api/milestones/update-milestone/**",
        "/api/milestones/no-photo",
        "/api/milestones/all",
    };

    private SecurityConstants() {}
}