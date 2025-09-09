# Smart Email Assistant

A comprehensive Spring Boot REST API application for managing emails, users, categories, follow-ups, and templates.

## Features

- **User Management**: Create and manage users
- **Email Management**: Full CRUD operations with search, filter, sort, and archive capabilities
- **Categories**: Organize emails into categories
- **Follow-ups**: Track and manage email follow-ups with automatic overdue detection
- **Templates**: Create reusable email templates with placeholder support
- **Export**: Export user emails in JSON or CSV format
- **Comprehensive API**: RESTful endpoints for all operations

## Technologies Used

- Spring Boot 3.2.0
- Spring Data JPA
- Hibernate
- MySQL 8+
- Maven
- Apache Commons CSV

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- MySQL Workbench (recommended for database setup)

## Database Setup

1. Install MySQL and start the MySQL service
2. Open MySQL Workbench
3. Run the `database_setup.sql` script to create the database and populate it with sample data
4. Update `src/main/resources/application.properties` with your MySQL credentials if different:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

## Running the Application

1. Clone or download the project
2. Navigate to the project directory
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
4. The application will start on `http://localhost:8080/api`

## API Documentation

The application provides comprehensive REST API endpoints. See `API_ENDPOINTS.md` for detailed documentation of all available endpoints.

### Base URL
```
http://localhost:8080/api
```

### Main Endpoints
- `/users` - User management
- `/emails` - Email management
- `/categories` - Category management
- `/followups` - Follow-up management
- `/templates` - Template management

## Testing with Postman

1. Import the API endpoints from `API_ENDPOINTS.md`
2. Set the base URL to `http://localhost:8080/api`
3. Use the sample data provided by the database setup script
4. Test all CRUD operations for each entity

### Sample Requests

**Create a User:**
```json
POST /api/users
{
    "name": "Test User",
    "email": "test@example.com"
}
```

**Search Emails:**
```
GET /api/emails/search?sender=john&sentiment=POSITIVE&page=0&size=5
```

**Export Emails:**
```
GET /api/emails/export?userId=1&format=csv
```

## Key Features

### Email Search & Filter
- Search by sender, recipient, subject
- Filter by category, sentiment, archived status
- Sort by any field in ascending or descending order
- Pagination support

### Follow-up Management
- Automatic overdue detection (runs every hour)
- Status tracking (Pending, Done, Snoozed, Overdue)
- Email-based follow-up association

### Template System
- Support for placeholders (e.g., {name}, {date})
- Variable substitution endpoint
- User-specific templates

### Export Functionality
- JSON and CSV export formats
- User-specific email exports
- Download-ready responses

## Database Schema

The application uses the following main entities:
- **Users**: User information and authentication
- **Emails**: Email data with relationships to users and categories
- **Categories**: Email categorization
- **FollowUps**: Email follow-up tracking
- **Templates**: Reusable email templates

## Error Handling

Comprehensive error handling with:
- Custom exception classes
- Global exception handler
- Detailed error responses
- Validation error messages

## Development

### Project Structure
```
src/
├── main/
│   ├── java/com/smartemail/
│   │   ├── controller/     # REST controllers
│   │   ├── model/         # Entity classes
│   │   ├── repository/    # Data access layer
│   │   ├── service/       # Business logic
│   │   └── exception/     # Exception handling
│   └── resources/
│       └── application.properties
└── test/                  # Test classes
```

### Adding New Features
1. Create entity in `model` package
2. Add repository interface in `repository` package
3. Implement business logic in `service` package
4. Create REST controller in `controller` package
5. Add exception handling if needed

## Production Deployment

For production deployment:
1. Update `application.properties` with production database settings
2. Configure proper logging levels
3. Set up database connection pooling
4. Consider adding security (Spring Security)
5. Implement proper backup strategies

## Support

For issues or questions, please refer to:
- API documentation in `API_ENDPOINTS.md`
- Database schema in `database_setup.sql`
- Application logs for debugging

## License

This project is for demonstration purposes. Modify and use as needed.