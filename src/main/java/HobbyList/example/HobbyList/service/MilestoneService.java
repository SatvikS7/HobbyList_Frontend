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
                m.getHobbyTag(),
                m.getManualState());
    }

    public void markMilestoneComplete(Long id) {
        Milestone m = milestoneRepository.findById(id).orElse(null);
        if (m == null)
            return;

        m.setManualState("complete");
        m.setCompleted(true);
        m.setCompletionRate(1.0);
        milestoneRepository.save(m);

        markChildrenComplete(m);
        updateParentsCompletion(m.getParent());
    }

    public void markMilestoneIncomplete(Long id) {
        Milestone m = milestoneRepository.findById(id).orElse(null);
        if (m == null)
            return;

        m.setManualState("incomplete");
        m.setCompleted(false);

        List<Milestone> children = m.getSubMilestones();
        if (children == null || children.isEmpty()) {
            m.setCompletionRate(0.0);
        } else {
            double sum = children.stream().mapToDouble(Milestone::getCompletionRate).sum();
            m.setCompletionRate(sum / children.size());
        }

        milestoneRepository.save(m);
        updateParentsCompletion(m.getParent());
    }

    private void markChildrenComplete(Milestone m) {
        if (m.getSubMilestones() != null) {
            for (Milestone child : m.getSubMilestones()) {
                child.setManualState("none");
                child.setCompleted(true);
                child.setCompletionRate(1.0);
                milestoneRepository.save(child);
                markChildrenComplete(child);
            }
        }
    }

    public void updateParentsCompletion(Milestone parent) {
        if (parent == null)
            return;

        List<Milestone> children = parent.getSubMilestones();
        double avgRate = 0.0;
        if (children != null && !children.isEmpty()) {
            double sum = children.stream().mapToDouble(Milestone::getCompletionRate).sum();
            avgRate = sum / children.size();
        } else {
            avgRate = parent.isCompleted() ? 1.0 : 0.0;
        }

        String state = parent.getManualState();
        if ("incomplete".equals(state)) {
            parent.setCompleted(false);
            parent.setCompletionRate(avgRate);
        } else if ("complete".equals(state)) {
            if (children != null && !children.isEmpty() && avgRate < 1.0) {
                parent.setManualState("none");
                parent.setCompleted(false);
                parent.setCompletionRate(avgRate);
            } else {
                parent.setCompleted(true);
                parent.setCompletionRate(1.0);
            }
        } else {
            parent.setCompletionRate(avgRate);
            parent.setCompleted(avgRate >= 1.0);
        }

        milestoneRepository.save(parent);
        updateParentsCompletion(parent.getParent());
    }
}
