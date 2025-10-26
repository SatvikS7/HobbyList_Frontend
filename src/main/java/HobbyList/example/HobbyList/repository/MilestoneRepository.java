package HobbyList.example.HobbyList.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import HobbyList.example.HobbyList.model.Milestone;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByUserIdAndParentIsNull(Long userId);
    List<Milestone> findByUserIdAndTaggedPhotoIsNull(Long userId);
    List<Milestone> findByUserId(Long userId);

    @Query("SELECT m FROM Milestone m LEFT JOIN FETCH m.subMilestones WHERE m.id = :id")
    Optional<Milestone> findByIdWithChildren(@Param("id") Long id);

}
