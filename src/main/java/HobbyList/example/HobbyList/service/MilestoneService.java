package HobbyList.example.HobbyList.service;

import java.util.stream.Collectors;

import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.model.Milestone;

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
            m.getTaggedPhoto() != null ? m.getTaggedPhoto().getId() : null
        );
    }
}
