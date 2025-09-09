package com.smartemail.repository;

import com.smartemail.model.Email;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {
    List<Email> findByUserId(Long userId);
    
    List<Email> findByUserIdAndArchived(Long userId, Boolean archived);
    
    Page<Email> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT e FROM Email e WHERE " +
           "(:sender IS NULL OR LOWER(e.sender) LIKE LOWER(CONCAT('%', :sender, '%'))) AND " +
           "(:recipient IS NULL OR LOWER(e.recipient) LIKE LOWER(CONCAT('%', :recipient, '%'))) AND " +
           "(:subject IS NULL OR LOWER(e.subject) LIKE LOWER(CONCAT('%', :subject, '%'))) AND " +
           "(:categoryId IS NULL OR e.categoryId = :categoryId) AND " +
           "(:sentiment IS NULL OR e.sentiment = :sentiment) AND " +
           "(:archived IS NULL OR e.archived = :archived)")
    Page<Email> searchEmails(@Param("sender") String sender,
                           @Param("recipient") String recipient,
                           @Param("subject") String subject,
                           @Param("categoryId") Long categoryId,
                           @Param("sentiment") Email.Sentiment sentiment,
                           @Param("archived") Boolean archived,
                           Pageable pageable);
    
    List<Email> findByCategoryId(Long categoryId);
    
    List<Email> findBySentiment(Email.Sentiment sentiment);
}