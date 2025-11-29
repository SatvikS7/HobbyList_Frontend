package HobbyList.example.HobbyList.controller;

import HobbyList.example.HobbyList.model.Milestone;
import HobbyList.example.HobbyList.model.Photo;
import HobbyList.example.HobbyList.model.User;
import HobbyList.example.HobbyList.repository.MilestoneRepository;
import HobbyList.example.HobbyList.repository.PhotoRepository;
import HobbyList.example.HobbyList.repository.UserRepository;
import HobbyList.example.HobbyList.service.HobbyService;
import HobbyList.example.HobbyList.service.MilestoneService;
import HobbyList.example.HobbyList.dto.MilestoneDto;
import HobbyList.example.HobbyList.mapper.MilestoneMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/milestones")
@CrossOrigin(origins = "http://localhost:5173")
public class MilestoneController {

    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final MilestoneMapper milestoneMapper;
    private final MilestoneService milestoneService;
    private final HobbyService hobbyService;

    private final int MAX_DEPTH = 5;

    public MilestoneController(MilestoneRepository milestoneRepository,
            UserRepository userRepository,
            PhotoRepository photoRepository,
            MilestoneMapper milestoneMapper,
            MilestoneService milestoneService,
            HobbyService hobbyService) {
        this.milestoneRepository = milestoneRepository;
        this.userRepository = userRepository;
        this.photoRepository = photoRepository;
        this.milestoneMapper = milestoneMapper;
        this.milestoneService = milestoneService;
        this.hobbyService = hobbyService;
    }

    // ---------------------------
    // Retrieve all parent (root) milestones for the authenticated user.
    // ---------------------------
    @GetMapping
    public ResponseEntity<?> getParentMilestones(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // If you want a hobby filter, implement a repository method. For now we return
        // all parent roots.
        List<Milestone> roots = milestoneRepository.findByUserIdAndParentIsNull(user.getId());
        List<MilestoneDto> dtoRoots = roots.stream()
                .map(milestoneService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoRoots);
    }

    // ---------------------------
    // Create a new task. Optional parent id can be provided.
    // If parent provided, ensure parent depth < 5.
    //
    // Request body example (JSON):
    // { "task": "Practice chords", "dueDate": "2025-11-01T15:00:00Z",
    // "isCompleted": false, "parentId": 12 }
    // ---------------------------
    // ---------------------------
    // Create a new task. Optional parent id can be provided.
    // If parent provided, ensure parent depth < 5.
    //
    // Request body example (JSON):
    // { "task": "Practice chords", "dueDate": "2025-11-01T15:00:00Z",
    // "isCompleted": false, "parentId": 12 }
    // ---------------------------
    @PostMapping
    public ResponseEntity<?> createMilestone(Authentication authentication,
            @RequestBody MilestoneDto req) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Milestone m = new Milestone();
        m.setTask(req.task());
        m.setDueDate(req.dueDate());
        m.setUser(user);
        m.setDateCreated(LocalDateTime.now());
        m.setTaggedPhotos(photoRepository.findAllById(req.taggedPhotoIds()));
        System.out.println("Creating milestone with parent: " + req.parentId());
        if (req.parentId() != null) {
            Optional<Milestone> parentOpt = milestoneRepository.findById(req.parentId());
            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Parent milestone not found.");
            }
            Milestone parent = parentOpt.get();

            // ensure parent belongs to same user
            if (parent.getUser() == null || parent.getUser().getId() != user.getId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Parent milestone does not belong to user.");
            }

            if (parent.getDepth() >= MAX_DEPTH) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cannot create subtask: parent depth >= " + MAX_DEPTH + ".");
            }

            m.setParent(parent);
            m.setDepth(parent.getDepth() + 1);

            if (parent.getSubMilestones() == null) {
                parent.setSubMilestones(new ArrayList<>());
            }

            parent.getSubMilestones().add(m);
        } else {
            m.setDepth(0);
            m.setParent(null);
        }
        m.setHobbyTag(req.hobbyTag());

        Milestone saved = milestoneRepository.save(m);

        if (req.hobbyTag() != null && !req.hobbyTag().isEmpty()) {
            hobbyService.addHobbyToUser(user, req.hobbyTag());
        }

        milestoneService.updateParentsCompletion(saved.getParent());

        return ResponseEntity.status(HttpStatus.CREATED).body(milestoneService.toDto(saved));
    }

    // ---------------------------
    // Delete a task and all its children
    // We make this transactional to ensure cascade deletes succeed.
    // ---------------------------
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMilestone(Authentication authentication, @PathVariable Long id) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Milestone> targetOpt = milestoneRepository.findByIdWithChildren(id);
        if (targetOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        Milestone target = targetOpt.get();
        if (target.getUser() == null || target.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        milestoneRepository.delete(target);
        return ResponseEntity.ok("Deleted");
    }

    // ---------------------------
    // Update a task (partial): update dueDate and/or task name
    // ---------------------------

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateMilestone(Authentication authentication,
            @PathVariable Long id,
            @RequestBody MilestoneDto req) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Milestone> opt = milestoneRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        Milestone m = opt.get();
        if (m.getUser() == null || m.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        milestoneMapper.updateMilestoneFromDto(req, m);
        milestoneRepository.save(m);

        milestoneService.updateParentsCompletion(m.getParent());

        return ResponseEntity.ok(milestoneService.toDto(m));
    }

    // ---------------------------
    // Get all milestones (both parent and child) for the user that don't have a
    // photo tagged to them
    // ---------------------------
    @GetMapping("/no-photo")
    public ResponseEntity<?> getMilestonesWithoutPhoto(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Milestone> result = milestoneRepository.findByUserIdAndTaggedPhotosIsNull(user.getId());
        return ResponseEntity.ok(result.stream().map(milestoneService::toDto).collect(Collectors.toList()));
    }

    // ---------------------------
    // Tag a photo with a milestone and then tag all children recursively with same
    // photo
    // ---------------------------
    /*
     * @Transactional
     * 
     * @PostMapping("/{milestoneId}/tag-photo/{photoId}")
     * public ResponseEntity<?> tagPhotoForMilestone(Authentication authentication,
     * 
     * @PathVariable Long milestoneId,
     * 
     * @PathVariable Long photoId) {
     * User user =
     * userRepository.findByEmail(authentication.getName()).orElse(null);
     * if (user == null) return
     * ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
     * 
     * Optional<Milestone> mOpt = milestoneRepository.findById(milestoneId);
     * if (mOpt.isEmpty()) return
     * ResponseEntity.status(HttpStatus.NOT_FOUND).body("Milestone not found");
     * 
     * Milestone milestone = mOpt.get();
     * if (milestone.getUser() == null || milestone.getUser().getId() !=
     * user.getId()) {
     * return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
     * }
     * 
     * Optional<Photo> pOpt = photoRepository.findById(photoId);
     * if (pOpt.isEmpty()) return
     * ResponseEntity.status(HttpStatus.NOT_FOUND).body("Photo not found");
     * 
     * Photo photo = pOpt.get();
     * 
     * // set for root milestone and all descendants
     * propagatePhotoTag(milestone, photo);
     * 
     * return ResponseEntity.ok("Photo tagged to milestone and all children");
     * }
     * 
     * 
     * // propagate photo tag to node and all descendants
     * private void propagatePhotoTag(Milestone node, Photo photo) {
     * node.setTaggedPhoto(photo);
     * milestoneRepository.save(node);
     * if (node.getSubtasks() != null) {
     * for (Milestone child : node.getSubtasks()) {
     * propagatePhotoTag(child, photo);
     * }
     * }
     * }
     */

    // optionally: get all milestones (parent + child) for a user
    @GetMapping("/all")
    public ResponseEntity<?> getAllMilestonesForUser(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Milestone> roots = milestoneRepository.findByUserId(user.getId());
        List<MilestoneDto> dtoRoots = roots.stream()
                .map(milestoneService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoRoots);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeMilestone(Authentication authentication, @PathVariable Long id) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Milestone> mOpt = milestoneRepository.findById(id);
        if (mOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Milestone not found");

        Milestone milestone = mOpt.get();
        if (milestone.getUser() == null || milestone.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        milestoneService.markMilestoneComplete(id);
        return ResponseEntity.ok("Milestone completed");
    }

    @PutMapping("/{id}/incomplete")
    public ResponseEntity<?> incompleteMilestone(Authentication authentication, @PathVariable Long id) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Milestone> mOpt = milestoneRepository.findById(id);
        if (mOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Milestone not found");

        Milestone milestone = mOpt.get();
        if (milestone.getUser() == null || milestone.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        milestoneService.markMilestoneIncomplete(id);
        return ResponseEntity.ok("Milestone marked incomplete");
    }
}
