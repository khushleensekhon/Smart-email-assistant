# Smart Email Assistant API Endpoints

This document provides a comprehensive guide to all available API endpoints in the Smart Email Assistant application.

## Base URL
```
http://localhost:8080/api
```

## Authentication
No authentication is required for this API.

## Users API (`/api/users`)

### Get All Users
```http
GET /users
```

### Get User by ID
```http
GET /users/{id}
```

### Create User
```http
POST /users
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john.doe@example.com"
}
```

### Update User
```http
PUT /users/{id}
Content-Type: application/json

{
    "name": "John Smith",
    "email": "john.smith@example.com"
}
```

### Delete User
```http
DELETE /users/{id}
```

## Categories API (`/api/categories`)

### Get All Categories
```http
GET /categories
```

### Get Category by ID
```http
GET /categories/{id}
```

### Create Category
```http
POST /categories
Content-Type: application/json

{
    "name": "Work",
    "description": "Work-related emails"
}
```

### Update Category
```http
PUT /categories/{id}
Content-Type: application/json

{
    "name": "Business",
    "description": "Business correspondence"
}
```

### Delete Category
```http
DELETE /categories/{id}
```

## Emails API (`/api/emails`)

### Get All Emails
```http
GET /emails
```

### Get Email by ID
```http
GET /emails/{id}
```

### Create Email
```http
POST /emails
Content-Type: application/json

{
    "userId": 1,
    "sender": "john@example.com",
    "recipient": "jane@example.com",
    "subject": "Meeting Tomorrow",
    "body": "Let's meet tomorrow at 10 AM",
    "categoryId": 1,
    "sentiment": "NEUTRAL"
}
```

### Update Email
```http
PUT /emails/{id}
Content-Type: application/json

{
    "userId": 1,
    "sender": "john@example.com",
    "recipient": "jane@example.com",
    "subject": "Updated Meeting Time",
    "body": "Let's meet tomorrow at 11 AM instead",
    "categoryId": 1,
    "sentiment": "NEUTRAL",
    "archived": false
}
```

### Delete Email
```http
DELETE /emails/{id}
```

### Archive Email
```http
PATCH /emails/{id}/archive
```

### Unarchive Email
```http
PATCH /emails/{id}/unarchive
```

### Get Emails by User ID
```http
GET /emails/user/{userId}
```

### Search Emails
```http
GET /emails/search?sender=john&recipient=jane&subject=meeting&categoryId=1&sentiment=POSITIVE&archived=false&page=0&size=10&sortBy=receivedAt&sortDir=desc
```

Query Parameters:
- `sender` (optional): Filter by sender email
- `recipient` (optional): Filter by recipient email
- `subject` (optional): Filter by subject (partial match)
- `categoryId` (optional): Filter by category ID
- `sentiment` (optional): Filter by sentiment (POSITIVE, NEGATIVE, NEUTRAL)
- `archived` (optional): Filter by archived status (true/false)
- `page` (default: 0): Page number
- `size` (default: 10): Number of items per page
- `sortBy` (default: receivedAt): Sort field
- `sortDir` (default: desc): Sort direction (asc/desc)

### Export Emails
```http
GET /emails/export?userId=1&format=json
```

Query Parameters:
- `userId` (required): User ID whose emails to export
- `format` (default: json): Export format (json/csv)

## Follow-ups API (`/api/followups`)

### Get All Follow-ups
```http
GET /followups
```

### Get Follow-up by ID
```http
GET /followups/{id}
```

### Create Follow-up
```http
POST /followups
Content-Type: application/json

{
    "emailId": 1,
    "dueDate": "2024-01-15T10:00:00",
    "status": "PENDING"
}
```

### Update Follow-up
```http
PUT /followups/{id}
Content-Type: application/json

{
    "emailId": 1,
    "dueDate": "2024-01-16T10:00:00",
    "status": "DONE"
}
```

### Update Follow-up Status
```http
PATCH /followups/{id}/status?status=DONE
```

Status values: `PENDING`, `DONE`, `SNOOZED`, `OVERDUE`

### Delete Follow-up
```http
DELETE /followups/{id}
```

### Get Follow-ups by Email ID
```http
GET /followups/email/{emailId}
```

### Get Overdue Follow-ups
```http
GET /followups/overdue
```

## Templates API (`/api/templates`)

### Get All Templates
```http
GET /templates
```

### Get Template by ID
```http
GET /templates/{id}
```

### Create Template
```http
POST /templates
Content-Type: application/json

{
    "userId": 1,
    "title": "Meeting Request",
    "body": "Hi {name}, would you like to meet on {date}? Best regards, {sender_name}"
}
```

### Update Template
```http
PUT /templates/{id}
Content-Type: application/json

{
    "userId": 1,
    "title": "Updated Meeting Request",
    "body": "Hello {name}, let's schedule a meeting for {date} at {time}. Thanks, {sender_name}"
}
```

### Delete Template
```http
DELETE /templates/{id}
```

### Get Templates by User ID
```http
GET /templates/user/{userId}
```

### Process Template
```http
POST /templates/{id}/process
Content-Type: application/json

{
    "name": "John",
    "date": "January 15, 2024",
    "time": "10:00 AM",
    "sender_name": "Jane"
}
```

## Error Responses

### 404 Not Found
```json
{
    "status": 404,
    "message": "Resource not found with id: 123",
    "timestamp": "2024-01-01T10:00:00"
}
```

### 400 Bad Request (Validation Error)
```json
{
    "status": 400,
    "message": "Validation failed",
    "timestamp": "2024-01-01T10:00:00",
    "fieldErrors": {
        "name": "Name is required",
        "email": "Valid email is required"
    }
}
```

### 409 Conflict
```json
{
    "status": 409,
    "message": "User already exists with email: john@example.com",
    "timestamp": "2024-01-01T10:00:00"
}
```

### 500 Internal Server Error
```json
{
    "status": 500,
    "message": "An unexpected error occurred: Database connection failed",
    "timestamp": "2024-01-01T10:00:00"
}
```

## Sample Test Data

The database is pre-populated with sample data including:
- 5 users
- 7 categories
- 10 sample emails
- 5 follow-ups
- 5 email templates

You can use this data to test all the API endpoints immediately after setup.