package com.smartemail.service;

import com.smartemail.exception.ResourceNotFoundException;
import com.smartemail.exception.DuplicateResourceException;
import com.smartemail.model.User;
import com.smartemail.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException("User already exists with email: " + user.getEmail());
        }
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        // Check if email is being changed and if new email already exists
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new DuplicateResourceException("User already exists with email: " + userDetails.getEmail());
        }
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}