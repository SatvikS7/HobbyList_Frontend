package HobbyList.example.HobbyList.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import HobbyList.example.HobbyList.model.Milestone;
import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.dto.PhotoDto;
import HobbyList.example.HobbyList.repository.PhotoRepository;

@Service
public class PhotoService {
    private final PhotoRepository photoRepository;

    public PhotoService(PhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }
    
    public Photo getPhotoById(Long id) {
        return photoRepository.findById(id).orElse(null);
    }

    public Photo savePhoto(Photo photo) {
        return photoRepository.save(photo);
    }

    public void deletePhoto(Long id) {
        photoRepository.deleteById(id);
    }

    public PhotoDto toDto(Photo photo, String preSignedURL) {
        return new PhotoDto(
            photo.getId(),
            photo.getTopic(),
            preSignedURL,
            photo.getDescription(),
            photo.getUploadDate(),
            photo.getTaggedMilestones() != null ? photo.getTaggedMilestones().stream().map(Milestone::getId).collect(Collectors.toList()) : null
        );
    }
}
