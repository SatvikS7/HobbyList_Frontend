package HobbyList.example.HobbyList.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import HobbyList.example.HobbyList.dto.PhotoDto;
import HobbyList.example.HobbyList.dto.PresignRequest;
import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.PhotoRepository;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.service.JwtService;
import HobbyList.example.HobbyList.service.S3Service;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/photos")
public class PhotoController {
    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final S3Service s3Service;
    private final JwtService jwtService;

    public PhotoController(UserRepository userRepository, PhotoRepository photoRepository, S3Service s3Service, JwtService jwtService) {
        this.userRepository = userRepository;
        this.photoRepository = photoRepository;
        this.s3Service = s3Service;
        this.jwtService = jwtService;
    }

    /*
    @GetMapping
    public ResponseEntity<List<PhotoDto>> getAllPhotos(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Photo> photos = photoRepository.findByUser(user);
        List<PhotoDto> photoDtos = photos.stream()
                .map(photo -> new PhotoDto(photo.getTopic(), photo.getImageUrl(), photo.getUploadDate()))
                .toList();
        return ResponseEntity.ok(photoDtos);
    }*/

    @PostMapping("/get-upload-url")
    public ResponseEntity<String> generateUploadUrl(@RequestBody PresignRequest presignRequest, Authentication authentication) {
        System.out.println("AUTH EMAIL: " + authentication.getName());
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Assuming S3Service is a service that generates pre-signed URLs
        String bucketName = "hobbylist-photos"; 
        String key = "photos/" + user.getId() + "/" + UUID.randomUUID() + "-" + presignRequest.filename(); // Define your key structure
        String uploadUrl = s3Service.generateUploadUrl(bucketName, key, presignRequest.contentType());

        return ResponseEntity.ok(uploadUrl);
    }

    @PostMapping("/save-url")
    public ResponseEntity<String> saveURL(@Valid @RequestBody PhotoDto photoDto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Photo photo = new Photo(photoDto.topic(), photoDto.imageUrl(), user, photoDto.uploadDate());
        photo.setFilename(photoDto.filename());
        photo.setSize(photoDto.size());
        photo.setContentType(photoDto.contentType());
        photoRepository.save(photo);

        return ResponseEntity.ok("Photo metadata saved successfully");
    }
    
    
}
