package HobbyList.example.HobbyList.mapper;

import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.dto.ProfileDto;
import HobbyList.example.HobbyList.model.Milestone;
import HobbyList.example.HobbyList.model.User;

import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MilestoneMapper{
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateMilestoneFromDto(MilestoneDto dto, @MappingTarget Milestone milestone);

    @AfterMapping
    default void handleBooleans(MilestoneDto dto, @MappingTarget Milestone milestone) {
        if (dto.isCompleted() != null) {
            milestone.setCompleted(dto.isCompleted());
        }
    }
}
