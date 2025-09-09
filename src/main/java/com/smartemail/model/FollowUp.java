package com.smartemail.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "followups")
public class FollowUp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Email ID is required")
    @Column(name = "email_id", nullable = false)
    private Long emailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_id", insertable = false, updatable = false)
    @JsonBackReference("email-followups")
    private Email email;

    @NotNull(message = "Due date is required")
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    public enum Status {
        PENDING, DONE, SNOOZED, OVERDUE
    }

    // Default constructor
    public FollowUp() {}

    // Constructor with parameters
    public FollowUp(Long emailId, LocalDateTime dueDate, Status status) {
        this.emailId = emailId;
        this.dueDate = dueDate;
        this.status = status != null ? status : Status.PENDING;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmailId() {
        return emailId;
    }

    public void setEmailId(Long emailId) {
        this.emailId = emailId;
    }

    public Email getEmail() {
        return email;
    }

    public void setEmail(Email email) {
        this.email = email;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}