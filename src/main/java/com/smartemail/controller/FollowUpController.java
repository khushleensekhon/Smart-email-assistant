package com.smartemail.controller;

import com.smartemail.model.FollowUp;
import com.smartemail.service.FollowUpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/followups")
@CrossOrigin(origins = "*")
public class FollowUpController {
    
    @Autowired
    private FollowUpService followUpService;
    
    @GetMapping
    public ResponseEntity<List<FollowUp>> getAllFollowUps() {
        List<FollowUp> followUps = followUpService.getAllFollowUps();
        return ResponseEntity.ok(followUps);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FollowUp> getFollowUpById(@PathVariable Long id) {
        FollowUp followUp = followUpService.getFollowUpById(id);
        return ResponseEntity.ok(followUp);
    }
    
    @PostMapping
    public ResponseEntity<FollowUp> createFollowUp(@Valid @RequestBody FollowUp followUp) {
        FollowUp createdFollowUp = followUpService.createFollowUp(followUp);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFollowUp);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FollowUp> updateFollowUp(@PathVariable Long id, @Valid @RequestBody FollowUp followUpDetails) {
        FollowUp updatedFollowUp = followUpService.updateFollowUp(id, followUpDetails);
        return ResponseEntity.ok(updatedFollowUp);
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<FollowUp> updateFollowUpStatus(@PathVariable Long id, @RequestParam FollowUp.Status status) {
        FollowUp updatedFollowUp = followUpService.updateFollowUpStatus(id, status);
        return ResponseEntity.ok(updatedFollowUp);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFollowUp(@PathVariable Long id) {
        followUpService.deleteFollowUp(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/email/{emailId}")
    public ResponseEntity<List<FollowUp>> getFollowUpsByEmailId(@PathVariable Long emailId) {
        List<FollowUp> followUps = followUpService.getFollowUpsByEmailId(emailId);
        return ResponseEntity.ok(followUps);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<FollowUp>> getOverdueFollowUps() {
        List<FollowUp> overdueFollowUps = followUpService.getOverdueFollowUps();
        return ResponseEntity.ok(overdueFollowUps);
    }
}