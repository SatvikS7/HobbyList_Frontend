package HobbyList.example.HobbyList.controller;

import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HobbyList.example.HobbyList.dto.PhotoDto;
import HobbyList.example.HobbyList.dto.PresignRequest;
import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.dto.HobbyDto;
import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.PhotoRepository;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.service.S3Service;
import HobbyList.example.HobbyList.mapper.UserMapper;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;



@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final S3Service s3Service;
    private final UserMapper userMapper;

    public ProfileController(UserRepository userRepository, PhotoRepository photoRepository, S3Service s3Service, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.photoRepository = photoRepository;
        this.s3Service = s3Service;
        this.userMapper = userMapper;
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

        // Use UserMapper to update user entity from non-null DTO fields
        userMapper.updateUserFromDto(profileDto, user);
        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully");
    }

    // Add a single new hobby
    @PostMapping("/hobbies")
    public ResponseEntity<String> updateHobbies(@RequestBody HobbyDto hobby, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String hobbyName = hobby.name();

        if (hobbyName == null || hobbyName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid hobby value.");
        }

        if (user.getHobbies().contains(hobbyName)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Hobby already exists.");
        }

        user.getHobbies().add(hobbyName);
        userRepository.save(user);

        return ResponseEntity.ok("Hobbies updated successfully");
    }
    // Delete a single hobby
    /*
    @DeleteMapping("/hobbies")
    public ResponseEntity<String> deleteHobby(@RequestBody HobbyDto hobby, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String hobbyName = hobby.name();

        if (hobbyName == null || hobbyName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid hobby value.");
        }

        if (!user.getHobbies().contains(hobbyName)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Hobby not found.");
        }

        user.getHobbies().remove(hobbyName);
        userRepository.save(user);

        return ResponseEntity.ok("Hobby deleted successfully");
    }
        */

    @PutMapping("hobbies")
    public ResponseEntity<String> putMethodName(@RequestBody List<HobbyDto> hobbies, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ArrayList<String> hobbyNames = new ArrayList<>();
        for (HobbyDto hobby : hobbies) {
            hobbyNames.add(hobby.name());
        }
        user.setHobbies(hobbyNames);   // overwrite entire list
        userRepository.save(user);

        return ResponseEntity.ok("Hobbies replaced successfully");
    }

    @GetMapping("hobbies")
    public ResponseEntity<List<HobbyDto>> getHobbies(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<HobbyDto> hobbies = user.getHobbies().stream()
            .map(hobbyName -> new HobbyDto(hobbyName))
            .collect(Collectors.toList());

        return ResponseEntity.ok(hobbies);
    }
    
}