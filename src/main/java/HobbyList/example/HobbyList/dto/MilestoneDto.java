package HobbyList.example.HobbyList.dto;

import java.time.OffsetDateTime;
import java.util.List;

import HobbyList.example.HobbyList.model.Milestone;
import HobbyList.example.HobbyList.model.Photo;

public record MilestoneDto(
    Long id,
    String task,
    OffsetDateTime dueDate,
    Boolean isCompleted,
    Long parentId,
    List<MilestoneDto> subMilestones,
    List<Long> taggedPhotoIds,
    String hobbyTag
) {
    public MilestoneDto(Long id, String task, OffsetDateTime dueDate, Boolean isCompleted, Long parentId, List<MilestoneDto> subMilestones, List<Long> taggedPhotoIds, String hobbyTag) {
        this.id = id;
        this.task = task;
        this.dueDate = dueDate;
        this.isCompleted = isCompleted;
        this.parentId = parentId;
        this.subMilestones = subMilestones;
        this.taggedPhotoIds = taggedPhotoIds;
        this.hobbyTag = hobbyTag;
    }
}
