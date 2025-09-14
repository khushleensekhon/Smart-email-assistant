package com.smartemail.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class EmailReplyService {

    public Map<String, String> generateReply(String subject, String body, String senderEmail) {
        Map<String, String> reply = new HashMap<>();
        
        // Extract sender name from email
        String senderName = extractNameFromEmail(senderEmail);
        
        // Analyze email content to determine reply type
        String replyType = analyzeEmailType(subject, body);
        
        // Generate appropriate reply based on type
        String replySubject = generateReplySubject(subject);
        String replyBody = generateReplyBody(subject, body, senderName, replyType);
        
        reply.put("subject", replySubject);
        reply.put("body", replyBody);
        reply.put("type", replyType);
        reply.put("suggestedTone", getSuggestedTone(subject, body));
        
        return reply;
    }
    
    private String extractNameFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "there";
        }
        
        String localPart = email.split("@")[0];
        // Convert email format to name (e.g., john.doe -> John Doe)
        String[] words = localPart.replace(".", " ")
                                 .replace("_", " ")
                                 .replace("-", " ")
                                 .toLowerCase()
                                 .split("\\s+");
        
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1))
                      .append(" ");
            }
        }
        return result.toString().trim();
    }
    
    private String analyzeEmailType(String subject, String body) {
        String content = (subject + " " + body).toLowerCase();
        
        // Meeting related
        if (containsKeywords(content, "meeting", "schedule", "appointment", "call", "conference")) {
            return "meeting";
        }
        
        // Question/Inquiry
        if (containsKeywords(content, "question", "ask", "inquiry", "help", "how", "what", "when", "where", "why")) {
            return "inquiry";
        }
        
        // Request
        if (containsKeywords(content, "request", "need", "require", "please", "could you", "would you")) {
            return "request";
        }
        
        // Complaint/Issue
        if (containsKeywords(content, "problem", "issue", "complaint", "error", "wrong", "not working")) {
            return "complaint";
        }
        
        // Thank you/Appreciation
        if (containsKeywords(content, "thank", "thanks", "appreciate", "grateful")) {
            return "appreciation";
        }
        
        // Follow-up
        if (containsKeywords(content, "follow up", "follow-up", "checking", "status", "update")) {
            return "followup";
        }
        
        // Urgent
        if (containsKeywords(content, "urgent", "asap", "immediately", "emergency", "critical")) {
            return "urgent";
        }
        
        // General
        return "general";
    }
    
    private boolean containsKeywords(String content, String... keywords) {
        for (String keyword : keywords) {
            if (content.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
    
    private String generateReplySubject(String originalSubject) {
        if (originalSubject.toLowerCase().startsWith("re:")) {
            return originalSubject;
        }
        return "Re: " + originalSubject;
    }
    
    private String generateReplyBody(String subject, String body, String senderName, String replyType) {
        StringBuilder reply = new StringBuilder();
        
        // Greeting
        reply.append("Hi ").append(senderName).append(",\n\n");
        
        // Generate reply based on type
        switch (replyType) {
            case "meeting":
                reply.append(generateMeetingReply(subject, body));
                break;
            case "inquiry":
                reply.append(generateInquiryReply(subject, body));
                break;
            case "request":
                reply.append(generateRequestReply(subject, body));
                break;
            case "complaint":
                reply.append(generateComplaintReply(subject, body));
                break;
            case "appreciation":
                reply.append(generateAppreciationReply(subject, body));
                break;
            case "followup":
                reply.append(generateFollowUpReply(subject, body));
                break;
            case "urgent":
                reply.append(generateUrgentReply(subject, body));
                break;
            default:
                reply.append(generateGeneralReply(subject, body));
        }
        
        // Closing
        reply.append("\n\nBest regards,\n[Your Name]");
        
        return reply.toString();
    }
    
    private String generateMeetingReply(String subject, String body) {
        if (containsKeywords(body.toLowerCase(), "tomorrow", "next week", "monday", "tuesday", "wednesday", "thursday", "friday")) {
            return "Thank you for reaching out regarding the meeting. I'd be happy to schedule a time to discuss this further. " +
                   "Please let me know your availability and I'll do my best to accommodate your schedule.\n\n" +
                   "I look forward to our conversation.";
        }
        return "Thank you for the meeting invitation. I appreciate you reaching out and would be interested in discussing this further. " +
               "Could you please provide more details about the agenda and your preferred time slots?";
    }
    
    private String generateInquiryReply(String subject, String body) {
        return "Thank you for your question. I appreciate you taking the time to reach out. " +
               "I'll need to gather some additional information to provide you with the most accurate response. " +
               "Could you please provide more details about [specific aspect]? " +
               "I'll get back to you with a comprehensive answer as soon as possible.";
    }
    
    private String generateRequestReply(String subject, String body) {
        return "Thank you for your request. I've received your message and I'm currently reviewing the details. " +
               "I'll need to check our current capacity and requirements to provide you with the most accurate response. " +
               "I'll get back to you within [timeframe] with an update on your request.";
    }
    
    private String generateComplaintReply(String subject, String body) {
        return "I sincerely apologize for any inconvenience this may have caused. " +
               "I take your feedback very seriously and want to ensure we resolve this matter promptly. " +
               "I'm currently investigating the issue and will provide you with a detailed response and solution within [timeframe]. " +
               "Thank you for bringing this to our attention.";
    }
    
    private String generateAppreciationReply(String subject, String body) {
        return "You're very welcome! I'm delighted to hear that I could be of help. " +
               "It's always a pleasure to work with you, and I appreciate you taking the time to share your kind words. " +
               "Please don't hesitate to reach out if you need any further assistance.";
    }
    
    private String generateFollowUpReply(String subject, String body) {
        return "Thank you for following up. I appreciate your patience and want to provide you with a current status update. " +
               "I'm currently working on [specific task/project] and expect to have more information for you by [date]. " +
               "I'll keep you posted on any developments and will reach out as soon as I have updates to share.";
    }
    
    private String generateUrgentReply(String subject, String body) {
        return "I understand this is urgent and I'm prioritizing your request immediately. " +
               "I'm currently reviewing the situation and will provide you with a response as soon as possible. " +
               "If this requires immediate attention, please don't hesitate to call me directly at [phone number]. " +
               "I'll do everything I can to address this promptly.";
    }
    
    private String generateGeneralReply(String subject, String body) {
        return "Thank you for your email. I've received your message and I'm currently reviewing the contents. " +
               "I appreciate you reaching out and I'll get back to you with a detailed response as soon as possible. " +
               "If you have any urgent matters, please don't hesitate to contact me directly.";
    }
    
    private String getSuggestedTone(String subject, String body) {
        String content = (subject + " " + body).toLowerCase();
        
        if (containsKeywords(content, "urgent", "asap", "immediately", "emergency")) {
            return "Professional and urgent";
        }
        
        if (containsKeywords(content, "thank", "thanks", "appreciate")) {
            return "Warm and appreciative";
        }
        
        if (containsKeywords(content, "problem", "issue", "complaint", "error")) {
            return "Apologetic and solution-focused";
        }
        
        if (containsKeywords(content, "meeting", "schedule", "collaboration")) {
            return "Professional and collaborative";
        }
        
        return "Professional and friendly";
    }
}
