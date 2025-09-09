package com.smartemail.service;

import java.io.IOException;
import java.io.StringWriter;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.smartemail.exception.ResourceNotFoundException;
import com.smartemail.model.Email;
import com.smartemail.repository.EmailRepository;

@Service
public class EmailService {
    
    @Autowired
    private EmailRepository emailRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CategoryService categoryService;
    
    public List<Email> getAllEmails() {
        return emailRepository.findAll();
    }
    
    public Email getEmailById(Long id) {
        return emailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found with id: " + id));
    }
    
    public Email createEmail(Email email) {
        // Validate user exists
        userService.getUserById(email.getUserId());
        
        // Validate category exists
        categoryService.getCategoryById(email.getCategoryId());
        
        return emailRepository.save(email);
    }
    
    public Email updateEmail(Long id, Email emailDetails) {
        Email email = getEmailById(id);
        
        // Validate user exists if userId is being changed
        if (!email.getUserId().equals(emailDetails.getUserId())) {
            userService.getUserById(emailDetails.getUserId());
        }
        
        // Validate category exists if categoryId is being changed
        if (!email.getCategoryId().equals(emailDetails.getCategoryId())) {
            categoryService.getCategoryById(emailDetails.getCategoryId());
        }
        
        email.setUserId(emailDetails.getUserId());
        email.setSender(emailDetails.getSender());
        email.setRecipient(emailDetails.getRecipient());
        email.setSubject(emailDetails.getSubject());
        email.setBody(emailDetails.getBody());
        email.setCategoryId(emailDetails.getCategoryId());
        email.setSentiment(emailDetails.getSentiment());
        email.setArchived(emailDetails.getArchived());
        
        return emailRepository.save(email);
    }
    
    public void deleteEmail(Long id) {
        Email email = getEmailById(id);
        emailRepository.delete(email);
    }
    
    public Email archiveEmail(Long id) {
        Email email = getEmailById(id);
        email.setArchived(true);
        return emailRepository.save(email);
    }
    
    public Email unarchiveEmail(Long id) {
        Email email = getEmailById(id);
        email.setArchived(false);
        return emailRepository.save(email);
    }
    
    public List<Email> getEmailsByUserId(Long userId) {
        userService.getUserById(userId); // Validate user exists
        return emailRepository.findByUserId(userId);
    }
    
    public Page<Email> searchEmails(String sender, String recipient, String subject, 
                                  Long categoryId, Email.Sentiment sentiment, Boolean archived,
                                  int page, int size, String sortBy, String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return emailRepository.searchEmails(sender, recipient, subject, categoryId, sentiment, archived, pageable);
    }
    
    public String exportEmailsAsJson(Long userId) {
        List<Email> emails = getEmailsByUserId(userId);
        // Simple JSON conversion (you might want to use ObjectMapper for more complex scenarios)
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < emails.size(); i++) {
            Email email = emails.get(i);
            json.append("{")
                .append("\"id\":").append(email.getId()).append(",")
                .append("\"sender\":\"").append(email.getSender()).append("\",")
                .append("\"recipient\":\"").append(email.getRecipient()).append("\",")
                .append("\"subject\":\"").append(email.getSubject()).append("\",")
                .append("\"body\":\"").append(email.getBody()).append("\",")
                .append("\"sentiment\":\"").append(email.getSentiment()).append("\",")
                .append("\"archived\":").append(email.getArchived()).append(",")
                .append("\"receivedAt\":\"").append(email.getReceivedAt()).append("\"")
                .append("}");
            if (i < emails.size() - 1) json.append(",");
        }
        json.append("]");
        return json.toString();
    }
    
    public String exportEmailsAsCsv(Long userId) throws IOException {
        List<Email> emails = getEmailsByUserId(userId);
        
        StringWriter writer = new StringWriter();
        CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT
                .withHeader("ID", "Sender", "Recipient", "Subject", "Body", "Sentiment", "Archived", "Received At"));
        
        for (Email email : emails) {
            csvPrinter.printRecord(
                email.getId(),
                email.getSender(),
                email.getRecipient(),
                email.getSubject(),
                email.getBody(),
                email.getSentiment(),
                email.getArchived(),
                email.getReceivedAt()
            );
        }
        
        csvPrinter.flush();
        return writer.toString();
    }
}