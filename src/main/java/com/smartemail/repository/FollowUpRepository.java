package com.smartemail.repository;

import com.smartemail.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByEmailId(Long emailId);
    
    List<FollowUp> findByStatus(FollowUp.Status status);
    
    @Query("SELECT f FROM FollowUp f WHERE f.dueDate < :currentDate AND f.status = 'PENDING'")
    List<FollowUp> findOverdueFollowUps(LocalDateTime currentDate);
    
    @Query("SELECT f FROM FollowUp f WHERE f.status = 'OVERDUE'")
    List<FollowUp> findAllOverdue();
}