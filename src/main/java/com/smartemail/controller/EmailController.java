
package com.smartemail.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartemail.model.Email;
import com.smartemail.service.EmailService;
import com.smartemail.service.EmailReplyService;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/emails")
@CrossOrigin(origins = "*")
public class EmailController {
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private EmailReplyService emailReplyService;
    
    @GetMapping
    public ResponseEntity<List<Email>> getAllEmails() {
        List<Email> emails = emailService.getAllEmails();
        return ResponseEntity.ok(emails);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Email> getEmailById(@PathVariable Long id) {
        Email email = emailService.getEmailById(id);
        return ResponseEntity.ok(email);
    }
    
    @PostMapping
    public ResponseEntity<Email> createEmail(@Valid @RequestBody Email email) {
        Email createdEmail = emailService.createEmail(email);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmail);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Email> updateEmail(@PathVariable Long id, @Valid @RequestBody Email emailDetails) {
        Email updatedEmail = emailService.updateEmail(id, emailDetails);
        return ResponseEntity.ok(updatedEmail);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmail(@PathVariable Long id) {
        emailService.deleteEmail(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/archive")
    public ResponseEntity<Email> archiveEmail(@PathVariable Long id) {
        Email archivedEmail = emailService.archiveEmail(id);
        return ResponseEntity.ok(archivedEmail);
    }
    
    @PatchMapping("/{id}/unarchive")
    public ResponseEntity<Email> unarchiveEmail(@PathVariable Long id) {
        Email unarchivedEmail = emailService.unarchiveEmail(id);
        return ResponseEntity.ok(unarchivedEmail);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Email>> getEmailsByUserId(@PathVariable Long userId) {
        List<Email> emails = emailService.getEmailsByUserId(userId);
        return ResponseEntity.ok(emails);
    }

    @GetMapping("/sender")
public ResponseEntity<List<Email>> getEmailsBySender(@RequestParam String sender) {
    List<Email> emails = emailService.searchEmails(sender, null, null, null, null, null, 0, Integer.MAX_VALUE, "receivedAt", "desc").getContent();
    return ResponseEntity.ok(emails);
}
    
    @GetMapping("/search")
    public ResponseEntity<Page<Email>> searchEmails(
            @RequestParam(required = false) String sender,
            @RequestParam(required = false) String recipient,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Email.Sentiment sentiment,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "receivedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Page<Email> emails = emailService.searchEmails(sender, recipient, subject, categoryId, 
                                                     sentiment, archived, page, size, sortBy, sortDir);
        return ResponseEntity.ok(emails);
    }
    
    @GetMapping("/export")
    public ResponseEntity<String> exportEmails(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "json") String format) throws IOException {
        
        String exportData;
        MediaType mediaType;
        String filename;
        
        if ("csv".equalsIgnoreCase(format)) {
            exportData = emailService.exportEmailsAsCsv(userId);
            mediaType = MediaType.parseMediaType("text/csv");
            filename = "emails_" + userId + ".csv";
        } else {
            exportData = emailService.exportEmailsAsJson(userId);
            mediaType = MediaType.APPLICATION_JSON;
            filename = "emails_" + userId + ".json";
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDispositionFormData("attachment", filename);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(exportData);
    }
    
    @PostMapping("/{id}/generate-reply")
    public ResponseEntity<Map<String, String>> generateReply(@PathVariable Long id) {
        Email email = emailService.getEmailById(id);
        Map<String, String> reply = emailReplyService.generateReply(
            email.getSubject(), 
            email.getBody(), 
            email.getSender()
        );
        return ResponseEntity.ok(reply);
    }
    
    @PostMapping("/generate-reply")
    public ResponseEntity<Map<String, String>> generateReplyFromContent(
            @RequestParam String subject,
            @RequestParam String body,
            @RequestParam String senderEmail) {
        Map<String, String> reply = emailReplyService.generateReply(subject, body, senderEmail);
        return ResponseEntity.ok(reply);
    }
}