package HobbyList.example.HobbyList.service;

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.model.Milestone;
import HobbyList.example.HobbyList.model.Photo;

@Service
public class MilestoneService {
    public MilestoneDto toDto(Milestone m) {
        return new MilestoneDto(
            m.getId(),
            m.getTask(),
            m.getDueDate(),
            m.isCompleted(),
            m.getParent() != null ? m.getParent().getId() : null,
            m.getSubMilestones().stream()
                .map(this::toDto)
                .collect(Collectors.toList()),
            m.getTaggedPhotos() != null ? m.getTaggedPhotos().stream().map(Photo::getId).collect(Collectors.toList()) : null,
            m.getHobbyTag()
        );
    }
}
