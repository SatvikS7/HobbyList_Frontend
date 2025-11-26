package HobbyList.example.HobbyList.service;

import java.util.stream.Collectors;
import java.util.List;

import org.springframework.stereotype.Service;

import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.model.Milestone;
import HobbyList.example.HobbyList.model.Photo;

@Service
public class MilestoneService {
    private final HobbyList.example.HobbyList.repository.MilestoneRepository milestoneRepository;

    public MilestoneService(HobbyList.example.HobbyList.repository.MilestoneRepository milestoneRepository) {
        this.milestoneRepository = milestoneRepository;
    }

    public MilestoneDto toDto(Milestone m) {
        return new MilestoneDto(
                m.getId(),
                m.getTask(),
                m.getDueDate(),
                m.isCompleted(),
                m.getCompletionRate(),
                m.getParent() != null ? m.getParent().getId() : null,
                m.getSubMilestones().stream()
                        .map(this::toDto)
                        .collect(Collectors.toList()),
                m.getTaggedPhotos() != null
                        ? m.getTaggedPhotos().stream().map(Photo::getId).collect(Collectors.toList())
                        : null,
                m.getHobbyTag());
    }

    public void markMilestoneComplete(Long id) {
        Milestone m = milestoneRepository.findById(id).orElse(null);
        if (m == null)
            return;

        markChildrenComplete(m);
        updateParentsCompletion(m.getParent());
    }

    private void markChildrenComplete(Milestone m) {
        m.setCompleted(true);
        m.setCompletionRate(1.0);
        milestoneRepository.save(m);

        if (m.getSubMilestones() != null) {
            for (Milestone child : m.getSubMilestones()) {
                markChildrenComplete(child);
            }
        }
    }

    public void updateParentsCompletion(Milestone parent) {
        if (parent == null)
            return;

        List<Milestone> children = parent.getSubMilestones();
        if (children == null || children.isEmpty()) {
            parent.setCompletionRate(parent.isCompleted() ? 1.0 : 0.0);
        } else {
            double sum = children.stream().mapToDouble(Milestone::getCompletionRate).sum();
            parent.setCompletionRate(sum / children.size());
        }

        parent.setCompleted(parent.getCompletionRate() >= 1.0);

        milestoneRepository.save(parent);
        updateParentsCompletion(parent.getParent());
    }
}
