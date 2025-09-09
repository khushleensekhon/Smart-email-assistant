package com.smartemail.service;

import com.smartemail.exception.ResourceNotFoundException;
import com.smartemail.exception.DuplicateResourceException;
import com.smartemail.model.Category;
import com.smartemail.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
    
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + category.getName());
        }
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        
        // Check if name is being changed and if new name already exists
        if (!category.getName().equals(categoryDetails.getName()) && 
            categoryRepository.existsByName(categoryDetails.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + categoryDetails.getName());
        }
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}