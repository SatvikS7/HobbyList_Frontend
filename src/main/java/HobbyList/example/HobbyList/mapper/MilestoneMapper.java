package HobbyList.example.HobbyList.mapper;

import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.model.Milestone;
import HobbyList.example.HobbyList.repository.MilestoneRepository;
import HobbyList.example.HobbyList.repository.PhotoRepository;

import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MilestoneMapper {

    private final MilestoneRepository milestoneRepository;
    private final PhotoRepository photoRepository;

    public MilestoneMapper(MilestoneRepository milestoneRepository, PhotoRepository photoRepository) {
        this.milestoneRepository = milestoneRepository;
        this.photoRepository = photoRepository;
    }

    public void updateMilestoneFromDto(MilestoneDto dto, Milestone milestone) {
        System.out.println("dto: " + dto);
        if (dto == null || milestone == null) {
            return;
        }

        if (dto.completed() != null) {
            milestone.setCompleted(dto.completed());
        }

        if (dto.task() != null) {
            milestone.setTask(dto.task());
        }
        if (dto.dueDate() != null) {
            milestone.setDueDate(dto.dueDate());
        }

        if (dto.parentId() != null) {
            Long parentId = dto.parentId();
            if (parentId != null) {
                milestone.setParent(milestoneRepository.findById(parentId).orElse(null));
            }
        }

        if (dto.hobbyTag() != null) {
            milestone.setHobbyTag(dto.hobbyTag());
        }
        /* 
        if (dto.subMilestones() != null) {
            List<Milestone> subMilestones = dto.subMilestones().stream()
                .map(subDto -> {
                    Milestone subMilestone = new Milestone();
                    updateMilestoneFromDto(subDto, subMilestone);
                    return subMilestone;
                })
                .toList();
            milestone.setSubMilestones(subMilestones);
        }*/

        if (dto.taggedPhotoIds() != null) {
            List<Long> photoIds = dto.taggedPhotoIds();
            if (photoIds != null){
                milestone.setTaggedPhotos(photoRepository.findAllById(photoIds));
        
            }
        }
    }
}
