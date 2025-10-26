package HobbyList.example.HobbyList.mapper;

import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.model.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    // Apply updates from a DTO to an existing User entity
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromDto(ProfileDto dto, @MappingTarget User user);

    @AfterMapping
    default void handleBooleans(ProfileDto dto, @MappingTarget User user) {
        if (dto.isPrivate() != null) {
            user.setPrivate(dto.isPrivate());
        }
    }
}
