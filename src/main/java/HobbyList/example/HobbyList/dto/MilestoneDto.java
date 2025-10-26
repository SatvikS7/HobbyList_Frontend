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
    Milestone parent,
    List<Milestone> subMilestones,
    Photo taggedPhotoId
) {
    public MilestoneDto(Long id, String task, OffsetDateTime dueDate, Boolean isCompleted, Milestone parent, List<Milestone> subMilestones, Photo taggedPhotoId) {
        this.id = id;
        this.task = task;
        this.dueDate = dueDate;
        this.isCompleted = isCompleted;
        this.parent = parent;
        this.subMilestones = subMilestones;
        this.taggedPhotoId = taggedPhotoId;
    }
}
