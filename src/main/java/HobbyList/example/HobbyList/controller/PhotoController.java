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
import HobbyList.example.HobbyList.repository.MilestoneRepository;
import HobbyList.example.HobbyList.model.Milestone;
import java.util.ArrayList;
import HobbyList.example.HobbyList.service.HobbyService;
import HobbyList.example.HobbyList.service.S3Service;
import HobbyList.example.HobbyList.service.PhotoService;
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
    private final HobbyService hobbyService;
    private final PhotoService photoService;
    private final MilestoneRepository milestoneRepository;

    public PhotoController(UserRepository userRepository, PhotoRepository photoRepository, S3Service s3Service,
            HobbyService hobbyService, PhotoService photoService, MilestoneRepository milestoneRepository) {
        this.userRepository = userRepository;
        this.photoRepository = photoRepository;
        this.s3Service = s3Service;
        this.hobbyService = hobbyService;
        this.photoService = photoService;
        this.milestoneRepository = milestoneRepository;
    }

    @GetMapping
    public ResponseEntity<List<PhotoDto>> getAllPhotos(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Photo> photos = photoRepository.findByUserIdAndIsProfileFalse(user.getId());
        List<PhotoDto> photoDtos = photos.stream()
                .map(photo -> {
                    String bucketName = "hobbylist-photos";
                    String imageURL = photo.getImageUrl();
                    String key = imageURL.substring(imageURL.indexOf("photos/"));
                    String presignedUrl = s3Service.generateDownloadUrl(bucketName, key);
                    return photoService.toDto(photo, presignedUrl);
                })
                .toList();
        return ResponseEntity.ok(photoDtos);
    }

    @PostMapping("/upload-url")
    public ResponseEntity<String> generateUploadUrl(@RequestBody PresignRequest presignRequest,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String bucketName = "hobbylist-photos";
        String key = "photos/" + user.getId() + "/" + UUID.randomUUID() + "-" + presignRequest.filename(); // Define
                                                                                                           // your key
                                                                                                           // structure
        String uploadUrl = s3Service.generateUploadUrl(bucketName, key, presignRequest.contentType());

        return ResponseEntity.ok(uploadUrl);
    }

    @PostMapping
    public ResponseEntity<String> saveURL(@Valid @RequestBody PhotoDto photoDto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Photo photo = new Photo(photoDto.topic(), photoDto.imageUrl(), user, photoDto.uploadDate());
        photo.setFilename(photoDto.filename());
        photo.setSize(photoDto.size());
        photo.setContentType(photoDto.contentType());
        photo.setDescription(photoDto.description());
        Photo savedPhoto = photoRepository.save(photo);

        if (photoDto.taggedMilestoneIds() != null && !photoDto.taggedMilestoneIds().isEmpty()) {
            List<Milestone> milestones = milestoneRepository.findAllById(photoDto.taggedMilestoneIds());
            for (Milestone milestone : milestones) {
                if (milestone.getTaggedPhotos() == null) {
                    milestone.setTaggedPhotos(new ArrayList<>());
                }
                milestone.getTaggedPhotos().add(savedPhoto);
            }
            milestoneRepository.saveAll(milestones);
        }

        hobbyService.addHobbyToUser(user, photoDto.topic());

        return ResponseEntity.ok("Photo metadata saved successfully");
    }
}
