package HobbyList.example.HobbyList.mapper;

import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.model.User;

import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    
    public void updateUserFromDto(ProfileDto dto, User user) {
        if (dto == null || user == null) {
            return;
        }

        if (dto.isPrivate() != null) {
            user.setPrivate(dto.isPrivate());
        }

        if (dto.description() != null) {
            user.setDescription(dto.description());
        }

        if (dto.displayName() != null) {
            user.setDisplayName(dto.displayName());
        }   

        if (dto.profileUrl() != null) {
            user.setProfileUrl(dto.profileUrl());
        }

        if (dto.hobbies() != null) {
            user.setHobbies(dto.hobbies());
        }
    }
}
