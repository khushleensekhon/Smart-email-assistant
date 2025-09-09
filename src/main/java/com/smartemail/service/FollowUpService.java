package com.smartemail.service;

import com.smartemail.exception.ResourceNotFoundException;
import com.smartemail.model.FollowUp;
import com.smartemail.repository.FollowUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FollowUpService {
    
    @Autowired
    private FollowUpRepository followUpRepository;
    
    @Autowired
    private EmailService emailService;
    
    public List<FollowUp> getAllFollowUps() {
        return followUpRepository.findAll();
    }
    
    public FollowUp getFollowUpById(Long id) {
        return followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));
    }
    
    public FollowUp createFollowUp(FollowUp followUp) {
        // Validate email exists
        emailService.getEmailById(followUp.getEmailId());
        
        return followUpRepository.save(followUp);
    }
    
    public FollowUp updateFollowUp(Long id, FollowUp followUpDetails) {
        FollowUp followUp = getFollowUpById(id);
        
        // Validate email exists if emailId is being changed
        if (!followUp.getEmailId().equals(followUpDetails.getEmailId())) {
            emailService.getEmailById(followUpDetails.getEmailId());
        }
        
        followUp.setEmailId(followUpDetails.getEmailId());
        followUp.setDueDate(followUpDetails.getDueDate());
        followUp.setStatus(followUpDetails.getStatus());
        
        return followUpRepository.save(followUp);
    }
    
    public FollowUp updateFollowUpStatus(Long id, FollowUp.Status status) {
        FollowUp followUp = getFollowUpById(id);
        followUp.setStatus(status);
        return followUpRepository.save(followUp);
    }
    
    public void deleteFollowUp(Long id) {
        FollowUp followUp = getFollowUpById(id);
        followUpRepository.delete(followUp);
    }
    
    public List<FollowUp> getFollowUpsByEmailId(Long emailId) {
        emailService.getEmailById(emailId); // Validate email exists
        return followUpRepository.findByEmailId(emailId);
    }
    
    public List<FollowUp> getOverdueFollowUps() {
        return followUpRepository.findAllOverdue();
    }
    
    // Scheduled task to automatically mark overdue follow-ups
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void markOverdueFollowUps() {
        LocalDateTime now = LocalDateTime.now();
        List<FollowUp> overdueFollowUps = followUpRepository.findOverdueFollowUps(now);
        
        for (FollowUp followUp : overdueFollowUps) {
            followUp.setStatus(FollowUp.Status.OVERDUE);
            followUpRepository.save(followUp);
        }
    }
}