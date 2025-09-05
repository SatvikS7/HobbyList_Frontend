package HobbyList.example.HobbyList.service;

import java.util.List;

import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.PhotoRepository;

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
}
