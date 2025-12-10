package HobbyList.example.HobbyList.dto;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public record MilestoneDto(
        Long id,
        String task,
        OffsetDateTime dueDate,
        Boolean completed,
        Double completionRate,
        Long parentId,
        List<MilestoneDto> subMilestones,
        List<Long> taggedPhotoIds,
        String hobbyTag,
        String manualState) {

    public Long getId() {
        return id;
    }

    public String getTask() {
        return task;
    }

    public long getParentId() {
        return parentId;
    }

    public List<Long> getSubMilestoneIds() {
        List<Long> subMilestoneIds = new ArrayList<>();
        for (MilestoneDto dto : subMilestones) {
            subMilestoneIds.add(dto.getId());
        }
        return subMilestoneIds;
    }
}
