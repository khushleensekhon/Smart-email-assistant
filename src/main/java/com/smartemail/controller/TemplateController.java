package com.smartemail.controller;

import com.smartemail.model.Template;
import com.smartemail.service.TemplateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/templates")
@CrossOrigin(origins = "*")
public class TemplateController {
    
    @Autowired
    private TemplateService templateService;
    
    @GetMapping
    public ResponseEntity<List<Template>> getAllTemplates() {
        List<Template> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Template> getTemplateById(@PathVariable Long id) {
        Template template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }
    
    @PostMapping
    public ResponseEntity<Template> createTemplate(@Valid @RequestBody Template template) {
        Template createdTemplate = templateService.createTemplate(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTemplate);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Template> updateTemplate(@PathVariable Long id, @Valid @RequestBody Template templateDetails) {
        Template updatedTemplate = templateService.updateTemplate(id, templateDetails);
        return ResponseEntity.ok(updatedTemplate);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Template>> getTemplatesByUserId(@PathVariable Long userId) {
        List<Template> templates = templateService.getTemplatesByUserId(userId);
        return ResponseEntity.ok(templates);
    }
    
    @PostMapping("/{id}/process")
    public ResponseEntity<String> processTemplate(@PathVariable Long id, @RequestBody Map<String, String> variables) {
        String processedContent = templateService.processTemplate(id, variables);
        return ResponseEntity.ok(processedContent);
    }
}