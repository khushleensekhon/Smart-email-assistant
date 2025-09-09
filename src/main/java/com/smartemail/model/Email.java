package com.smartemail.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "emails")
public class Email {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonBackReference("user-emails")
    private User user;

    @NotBlank(message = "Sender is required")
    @Column(nullable = false)
    private String sender;

    @NotBlank(message = "Recipient is required")
    @Column(nullable = false)
    private String recipient;

    @NotBlank(message = "Subject is required")
    @Column(nullable = false)
    private String subject;

    @Column(length = 5000)
    private String body;

    @NotNull(message = "Category ID is required")
    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    @JsonBackReference("category-emails")
    private Category category;

    @Enumerated(EnumType.STRING)
    private Sentiment sentiment;

    @Column(nullable = false)
    private Boolean archived = false;

    @CreationTimestamp
    @Column(name = "received_at", nullable = false, updatable = false)
    private LocalDateTime receivedAt;

    @OneToMany(mappedBy = "email", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("email-followups")
    private List<FollowUp> followUps;

    public enum Sentiment {
        POSITIVE, NEGATIVE, NEUTRAL
    }

    // Default constructor
    public Email() {}

    // Constructor with parameters
    public Email(Long userId, String sender, String recipient, String subject, String body, Long categoryId, Sentiment sentiment) {
        this.userId = userId;
        this.sender = sender;
        this.recipient = recipient;
        this.subject = subject;
        this.body = body;
        this.categoryId = categoryId;
        this.sentiment = sentiment;
        this.archived = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Sentiment getSentiment() {
        return sentiment;
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = sentiment;
    }

    public Boolean getArchived() {
        return archived;
    }

    public void setArchived(Boolean archived) {
        this.archived = archived;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public List<FollowUp> getFollowUps() {
        return followUps;
    }

    public void setFollowUps(List<FollowUp> followUps) {
        this.followUps = followUps;
    }
}