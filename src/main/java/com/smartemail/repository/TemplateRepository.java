package com.smartemail.repository;

import com.smartemail.model.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {
    List<Template> findByUserId(Long userId);
    
    List<Template> findByUserIdAndTitleContaining(Long userId, String title);
}