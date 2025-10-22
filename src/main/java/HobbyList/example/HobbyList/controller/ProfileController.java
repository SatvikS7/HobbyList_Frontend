package HobbyList.example.HobbyList.controller;

import java.util.UUID;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HobbyList.example.HobbyList.dto.PhotoDto;
import HobbyList.example.HobbyList.dto.PresignRequest;
import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.PhotoRepository;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.service.S3Service;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final S3Service s3Service;

    public ProfileController(UserRepository userRepository, PhotoRepository photoRepository, S3Service s3Service) {
        this.userRepository = userRepository;
        this.photoRepository = photoRepository;
        this.s3Service = s3Service;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Photo> profilePhoto = photoRepository.findByUserIdAndIsProfileTrue(user.getId());
        String presignedUrl = null;
        if (profilePhoto.isPresent()) {
            String bucketName = "hobbylist-photos";
            String imageURL = profilePhoto.get().getImageUrl();
            String key = imageURL.substring(imageURL.indexOf("profile/"));
            presignedUrl = s3Service.generateDownloadUrl(bucketName, key);
        }
        return ResponseEntity.ok(new ProfileDto(presignedUrl, user.getDescription(), user.getDisplayName(), user.isPrivate(), user.getHobbies()));
    }

    @PostMapping("/get-upload-url")
    public ResponseEntity<?> generateUploadUrl(@Valid @RequestBody PresignRequest presignRequest, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Delete existing profile picture if exists from photo repository
        Optional<Photo> existingProfilePic = photoRepository.findByUserIdAndIsProfileTrue(user.getId());
        if (existingProfilePic.isPresent()) {
            Photo oldPhoto = existingProfilePic.get();
            photoRepository.delete(oldPhoto);
        }
        String bucketName = "hobbylist-photos"; 
        String key = "profile/" + user.getId() + "-" + presignRequest.filename();
        String uploadUrl = s3Service.generateUploadUrl(bucketName, key, presignRequest.contentType());

        return ResponseEntity.ok(uploadUrl);
    }

    @PostMapping("/save-url")
    public ResponseEntity<String> saveURL(@Valid @RequestBody PhotoDto photoDto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Photo photo = new Photo(photoDto.imageUrl(), user, 
                    photoDto.uploadDate(), photoDto.filename(), 
                    photoDto.size(), photoDto.contentType());
        photoRepository.save(photo);

        return ResponseEntity.ok("Photo metadata saved successfully");
    }

    @PatchMapping("/update-profile")
    public ResponseEntity<String> updateProfile(@RequestBody ProfileDto profileDto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if(profileDto.description() != null) {
            user.setDescription(profileDto.description());
        }

        if(profileDto.username() != null) {
            user.setDisplayName(profileDto.username());
        }

        if(profileDto.isPrivate() != user.isPrivate()) {
            user.setPrivate(profileDto.isPrivate());
        }

        if(profileDto.hobbies() != null) {
            user.setHobbies(profileDto.hobbies());
        }

        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully");
    }
}
