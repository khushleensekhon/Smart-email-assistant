package com.smartemail.service;

import com.smartemail.exception.ResourceNotFoundException;
import com.smartemail.model.Template;
import com.smartemail.repository.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Map;

@Service
public class TemplateService {
    
    @Autowired
    private TemplateRepository templateRepository;
    
    @Autowired
    private UserService userService;
    
    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }
    
    public Template getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with id: " + id));
    }
    
    public Template createTemplate(Template template) {
        // Validate user exists
        userService.getUserById(template.getUserId());
        
        return templateRepository.save(template);
    }
    
    public Template updateTemplate(Long id, Template templateDetails) {
        Template template = getTemplateById(id);
        
        // Validate user exists if userId is being changed
        if (!template.getUserId().equals(templateDetails.getUserId())) {
            userService.getUserById(templateDetails.getUserId());
        }
        
        template.setUserId(templateDetails.getUserId());
        template.setTitle(templateDetails.getTitle());
        template.setBody(templateDetails.getBody());
        
        return templateRepository.save(template);
    }
    
    public void deleteTemplate(Long id) {
        Template template = getTemplateById(id);
        templateRepository.delete(template);
    }
    
    public List<Template> getTemplatesByUserId(Long userId) {
        userService.getUserById(userId); // Validate user exists
        return templateRepository.findByUserId(userId);
    }
    
    public String processTemplate(Long templateId, Map<String, String> variables) {
        Template template = getTemplateById(templateId);
        String processedBody = template.getBody();
        
        if (variables != null && !variables.isEmpty()) {
            Pattern pattern = Pattern.compile("\\{([^}]+)\\}");
            Matcher matcher = pattern.matcher(processedBody);
            
            StringBuffer result = new StringBuffer();
            while (matcher.find()) {
                String placeholder = matcher.group(1);
                String replacement = variables.getOrDefault(placeholder, matcher.group(0));
                matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
            }
            matcher.appendTail(result);
            processedBody = result.toString();
        }
        
        return processedBody;
    }
}