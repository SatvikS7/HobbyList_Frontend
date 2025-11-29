package HobbyList.example.HobbyList.dto;

import java.time.OffsetDateTime;
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
}
