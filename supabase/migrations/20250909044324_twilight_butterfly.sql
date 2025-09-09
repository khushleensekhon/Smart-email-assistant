-- Smart Email Assistant Database Setup Script
-- Run this script in MySQL Workbench to create the database and insert sample data

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS emaildb;
CREATE DATABASE emaildb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE emaildb;

-- Create Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Create Emails table
CREATE TABLE emails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT,
    category_id BIGINT NOT NULL,
    sentiment ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL'),
    archived BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Create Follow-ups table
CREATE TABLE followups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email_id BIGINT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status ENUM('PENDING', 'DONE', 'SNOOZED', 'OVERDUE') DEFAULT 'PENDING',
    FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

-- Create Templates table
CREATE TABLE templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (name, email) VALUES
('John Doe', 'john.doe@example.com'),
('Jane Smith', 'jane.smith@company.com'),
('Mike Johnson', 'mike.johnson@business.org'),
('Sarah Wilson', 'sarah.wilson@enterprise.net'),
('David Brown', 'david.brown@corporation.com');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Work', 'Work-related emails and correspondence'),
('Personal', 'Personal emails from friends and family'),
('Marketing', 'Marketing emails and promotional content'),
('Support', 'Customer support and technical assistance emails'),
('Newsletter', 'Newsletter subscriptions and updates'),
('Important', 'High priority and important emails'),
('Finance', 'Financial statements, invoices, and money-related emails');

-- Insert sample emails
INSERT INTO emails (user_id, sender, recipient, subject, body, category_id, sentiment, archived) VALUES
(1, 'boss@company.com', 'john.doe@example.com', 'Project Deadline Update', 'Hi John, I wanted to update you on the project deadline. We need to move it up by one week. Please let me know if this is feasible.', 1, 'NEUTRAL', false),
(1, 'mom@family.com', 'john.doe@example.com', 'Family Dinner This Sunday', 'Hey honey, don\'t forget about family dinner this Sunday at 6 PM. Your favorite lasagna will be ready!', 2, 'POSITIVE', false),
(1, 'marketing@store.com', 'john.doe@example.com', '50% Off Sale - Limited Time!', 'Don\'t miss out on our biggest sale of the year! 50% off on all items. Shop now before it\'s too late!', 3, 'NEUTRAL', true),
(2, 'client@business.com', 'jane.smith@company.com', 'Contract Review Required', 'Jane, could you please review the attached contract and provide your feedback by end of week?', 1, 'NEUTRAL', false),
(2, 'support@techcompany.com', 'jane.smith@company.com', 'Your Support Ticket #12345', 'Thank you for contacting our support team. We have resolved your issue and the system should be working normally now.', 4, 'POSITIVE', false),
(3, 'newsletter@techblog.com', 'mike.johnson@business.org', 'Weekly Tech Roundup', 'This week in technology: AI advances, new smartphone releases, and cybersecurity updates.', 5, 'NEUTRAL', false),
(3, 'accounting@vendor.com', 'mike.johnson@business.org', 'Invoice #INV-2024-001', 'Please find attached the invoice for services rendered last month. Payment is due within 30 days.', 7, 'NEUTRAL', false),
(4, 'hr@company.com', 'sarah.wilson@enterprise.net', 'Annual Performance Review', 'Sarah, it\'s time for your annual performance review. Please schedule a meeting with me for next week.', 6, 'NEUTRAL', false),
(4, 'friend@personal.com', 'sarah.wilson@enterprise.net', 'Congratulations on your promotion!', 'I heard about your promotion! So proud of you. Let\'s celebrate this weekend!', 2, 'POSITIVE', false),
(5, 'bank@financial.com', 'david.brown@corporation.com', 'Monthly Statement Available', 'Your monthly bank statement is now available online. Please review your transactions.', 7, 'NEUTRAL', false);

-- Insert sample follow-ups
INSERT INTO followups (email_id, due_date, status) VALUES
(1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'PENDING'),
(4, DATE_ADD(NOW(), INTERVAL 3 DAY), 'PENDING'),
(8, DATE_ADD(NOW(), INTERVAL 1 DAY), 'PENDING'),
(2, DATE_SUB(NOW(), INTERVAL 1 DAY), 'OVERDUE'),
(10, DATE_ADD(NOW(), INTERVAL 7 DAY), 'PENDING');

-- Insert sample templates
INSERT INTO templates (user_id, title, body) VALUES
(1, 'Meeting Request', 'Hi {name},\n\nI would like to schedule a meeting with you to discuss {topic}. Are you available on {date} at {time}?\n\nBest regards,\n{sender_name}'),
(1, 'Follow-up Email', 'Hi {name},\n\nI wanted to follow up on our previous conversation regarding {subject}. Please let me know if you need any additional information.\n\nThanks,\n{sender_name}'),
(2, 'Project Update', 'Dear {name},\n\nI wanted to provide you with an update on the {project_name} project. Current status: {status}\n\nNext steps:\n- {step1}\n- {step2}\n- {step3}\n\nBest regards,\n{sender_name}'),
(3, 'Thank You Note', 'Dear {name},\n\nThank you for {reason}. Your {contribution} was greatly appreciated.\n\nWarm regards,\n{sender_name}'),
(4, 'Appointment Confirmation', 'Hi {name},\n\nThis is to confirm your appointment on {date} at {time} for {service}. Please arrive 15 minutes early.\n\nIf you need to reschedule, please contact us at least 24 hours in advance.\n\nBest regards,\n{sender_name}');

-- Create indexes for better performance
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_category_id ON emails(category_id);
CREATE INDEX idx_emails_sender ON emails(sender);
CREATE INDEX idx_emails_recipient ON emails(recipient);
CREATE INDEX idx_emails_received_at ON emails(received_at);
CREATE INDEX idx_emails_archived ON emails(archived);
CREATE INDEX idx_followups_email_id ON followups(email_id);
CREATE INDEX idx_followups_due_date ON followups(due_date);
CREATE INDEX idx_followups_status ON followups(status);
CREATE INDEX idx_templates_user_id ON templates(user_id);

-- Display summary of inserted data
SELECT 'Database Setup Complete!' as Status;
SELECT 'Users created:' as Info, COUNT(*) as Count FROM users;
SELECT 'Categories created:' as Info, COUNT(*) as Count FROM categories;
SELECT 'Emails created:' as Info, COUNT(*) as Count FROM emails;
SELECT 'Follow-ups created:' as Info, COUNT(*) as Count FROM followups;
SELECT 'Templates created:' as Info, COUNT(*) as Count FROM templates;

-- Show some sample data
SELECT 'Sample Users:' as Info;
SELECT id, name, email FROM users LIMIT 3;

SELECT 'Sample Categories:' as Info;
SELECT id, name, description FROM categories LIMIT 3;

SELECT 'Sample Emails:' as Info;
SELECT id, sender, subject, sentiment FROM emails LIMIT 3;