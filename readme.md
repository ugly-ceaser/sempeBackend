# **SempeAlumni API Documentation**  

This documentation describes all routes, required headers, request bodies, responses, and usage details for the SempeAlumni API. **Ensure all requests requiring authentication include the appropriate headers**. Refer to the `.env.example` file for environment variables and assign appropriate values for configuration.

---

## **Base URL**  
```
http://localhost:3000/api
```  

---

# **Authentication Endpoints**  

These endpoints manage user registration, login, and verification.  

### **Global Header Requirements (for authenticated routes):**  
```
Authorization: Bearer <JWT_token>
Content-Type: application/json
```

---

## **1. Register User**  
Create a new user account.  

### **Endpoint**  
```
POST /auth/register
```

### **Headers**  
```
Content-Type: application/json
```

### **Request Body**  
```json
{
  "fullname": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

### **Validation Rules**  
- **Fullname:** Must contain at least two words (e.g., first and last name).  
- **Email:** Must be a valid, unique email.  
- **Password:** At least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.

### **Response**  
**201 Created**  
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64fe2c3f8...",
      "fullname": "John Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

**400 Bad Request**  
```json
{
  "error": "Email already exists or invalid input"
}
```

---

## **2. Login User**  
Authenticate an existing user and return a JWT token for subsequent requests.  

### **Endpoint**  
```
POST /auth/login
```

### **Request Body**  
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

### **Response**  
**200 OK**  
```json
{
  "message": "Logged in successfully",
  "data": {
    "user": {
      "_id": "64fe2c3f8...",
      "fullname": "John Doe",
      "email": "john.doe@example.com"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

**401 Unauthorized** – Invalid credentials.  
**404 Not Found** – User not found.  

---

## **3. Request Email Verification Link**  
Send a verification link to the user's email address.

### **Endpoint**  
```
POST /auth/email/request
```

### **Headers**  
```
Authorization: Bearer <JWT_token>
```

### **Request Body**  
```json
{
  "email": "john.doe@example.com",
  "redirect_url": "https://frontend-app.com/verify"
}
```

### **Response**  
**200 OK**  
```json
{
  "message": "Verification link sent successfully"
}
```

**404 Not Found**  
```json
{
  "error": "User not found"
}
```

---

## **4. Verify Email**  
Verify the user's email using the token received in the verification email.

### **Endpoint**  
```
GET /auth/email/verify?token=<verification_token>
```

### **Response**  
**200 OK**  
```json
{
  "message": "Email verified successfully",
  "data": {
    "_id": "64fe2c3f8...",
    "fullname": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

**401 Unauthorized** – Invalid token.  
**404 Not Found** – User not found.

---

## **5. Verify User Credentials**  
Retrieve the authenticated user’s data to confirm if their account is verified.

### **Endpoint**  
```
GET /auth/user/verify
```

### **Headers**  
```
Authorization: Bearer <JWT_token>
```

### **Response**  
**200 OK**  
```json
{
  "message": "User is verified",
  "data": {
    "user": {
      "_id": "64fe2c3f8...",
      "fullname": "John Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

**401 Unauthorized** – Token missing or email not verified.  
**404 Not Found** – User not found.

---

# **Projects Management Endpoints**  

This section describes how to manage **projects**. It includes creating, retrieving, updating, and deleting projects.

---

## **Project Schema**  
```json
{
  "projectType": "Website Development",
  "timeline": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "budget": 500000,
  "overview": "A project to build a website.",
  "isPublished": true,
  "status": "upcoming"
}
```

---

## **1. Create Project**  
Create a new project. **Admin only.**

### **Endpoint**  
```
POST /projects
```

### **Headers**  
```
Authorization: Bearer <Admin_JWT_token>
Content-Type: application/json
```

### **Request Body**  
```json
{
  "projectType": "Website Development",
  "timeline": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "budget": 500000,
  "overview": "A website development project.",
  "isPublished": true
}
```

### **Response**  
**201 Created**  
```json
{
  "message": "Project created successfully",
  "data": {
    "id": "64fe2c3f8...",
    "projectType": "Website Development",
    "timeline": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
    "budget": 500000,
    "overview": "A website development project.",
    "isPublished": true,
    "status": "upcoming"
  }
}
```

**400 Bad Request** – Invalid data input.  

---

## **2. Get All Projects**  
Retrieve all available projects with pagination.

### **Endpoint**  
```
GET /projects
```

### **Query Parameters**  
- **page** (default: 1): Page number.  
- **limit** (default: 10): Number of items per page.

### **Response**  
**200 OK**  
```json
{
  "data": [
    {
      "id": "64fe2c3f8...",
      "projectType": "Website Development",
      "overview": "A website development project.",
      "status": "upcoming"
    }
  ],
  "pagination": {
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10
  }
}
```

**404 Not Found** – No projects available.

---

## **3. Get Project by ID**  
Retrieve a specific project by its ID.

### **Endpoint**  
```
GET /projects/:projectId
```

### **Response**  
**200 OK**  
```json
{
  "data": {
    "id": "64fe2c3f8...",
    "projectType": "Website Development",
    "overview": "A website development project."
  }
}
```

**404 Not Found** – Project not found.

---

## **4. Update Project**  
Update an existing project. **Admin only.**

### **Endpoint**  
```
PUT /projects/:projectId
```

### **Headers**  
```
Authorization: Bearer <Admin_JWT_token>
```

### **Request Body**  
```json
{
  "budget": 600000,
  "status": "ongoing"
}
```

### **Response**  
**200 OK** – Project updated successfully.  
**404 Not Found** – Project not found.

---

## **5. Delete Project**  
Delete a project by ID. **Admin only.**

### **Endpoint**  
```
DELETE /projects/:projectId
```

### **Response**  
**200 OK**  
```json
{
  "message": "Project deleted successfully"
}
```

**404 Not Found** – Project not found.

---

# **Events Management Endpoints**  

This section describes how to manage **events**. It includes creating, retrieving, updating, and deleting events.

---

## **Event Schema**  
```json
{
  "eventType": "Webinar",
  "date": "2024-11-15",
  "time": "14:00",
  "location": "Online",
  "description": "A webinar on software development trends.",
  "isPublic": true
}
```

---

## **1. Create Event**  
Create a new event. **Admin only.**

### **Endpoint**  
```
POST /events
```

### **Headers**  
```
Authorization: Bearer <Admin_JWT_token>
Content-Type: application/json
```

### **Request Body**  
```json
{
  "eventType": "Webinar",
  "date": "2024-11-15",
  "time": "14:00",
  "location": "Online",
  "description": "A webinar on software development trends.",
  "isPublic": true
}
```

### **Response**  
**201 Created**  
```json
{
  "message": "Event created successfully",
  "data": {
    "id": "64fe2c3f8...",
    "eventType": "Webinar",
    "date": "2024-11-15",
    "time": "14:00",
    "location": "Online",
    "description": "A webinar on software development trends.",
    "isPublic": true
  }
}
```

**400 Bad Request** – Invalid data input.

---

## **2. Get All Events**  
Retrieve all available events with pagination.

### **Endpoint**  
```
GET /events
```

### **Query Parameters**  
- **page** (default: 1): Page number.  
- **limit** (default: 10): Number of items per page.

### **Response**  
**200 OK**  
```json
{
  "data": [
    {
      "id": "64fe2c3f8...",
      "eventType": "Webinar",
      "date": "2024-11-15",
      "description": "A webinar on software development trends."
    }
  ],
  "pagination": {
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10
  }
}
```

**404 Not Found** – No events available.

---

## **3. Get Event by ID**  
Retrieve a specific event by its ID.

### **Endpoint**  
```
GET /events/:eventId
```

### **Response**  
**200 OK**  
```json
{
  "data": {
    "id": "64fe2c3f8...",
    "eventType": "Webinar",
    "date": "2024-11-15",
    "description": "A webinar on software development trends."
  }
}
```

**404 Not Found** – Event not found.

---

## **4. Update Event**  
Update an existing event. **Admin only.**

### **Endpoint**  
```
PUT /events/:eventId
```

### **Headers**  
```
Authorization: Bearer <Admin_JWT_token>
```

### **Request Body**  
```json
{
  "date": "2024-12-01",
  "isPublic": false
}
```

### **Response**  
**200 OK** – Event updated successfully.  
**404 Not Found** – Event not found.

---

## **5. Delete Event**  
Delete an event by ID. **Admin only.**

### **Endpoint**  
```
DELETE /events/:eventId
```

### **Response**  
**200 OK**  
```json
{
  "message": "Event deleted successfully"
}
```

**404 Not Found** – Event not found.

---

# User API Documentation

## Overview

This API allows for managing user accounts, including registration, fetching user details, updating, activating/deactivating, and deletion. Each endpoint requires specific permissions as noted.

---

### 1. **Get All Users**

- **Endpoint**: `/users/`
- **Method**: `GET`
- **Access**: **Admin only**
- **Description**: Retrieve a list of all users with pagination.

**Request Query Parameters**:
  - `page` (integer, optional): Page number (default: 1).
  - `limit` (integer, optional): Users per page (default: 10).

**Response**:
```json
{
  "success": true,
  "message": "returning all users",
  "data": [
    {
      "id": "user_id",
      "fullname": "User Name",
      "email": "user@example.com",
      "dob": "YYYY-MM-DD",
      "nickname": "nickname",
      "imageUrl": "image_url",
      "phone": "1234567890",
      "isVerified": true,
      "isAdmin": false,
      "isActive": true
    }
  ],
  "pagination": {
    "total": 50,
    "totalPages": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2. **Register User**

- **Endpoint**: `/users/`
- **Method**: `POST`
- **Access**: **Admin only**
- **Description**: Register a new user with required validation.

**Request Body**:
  - `fullname` (string, required)
  - `email` (string, required)
  - `location` (string, required)

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "fullname": "User Name",
    "email": "user@example.com",
    "location": "location_value",
    "isVerified": false,
    "isAdmin": false,
    "isActive": true
  }
}
```

---

### 3. **Get User by ID**

- **Endpoint**: `/users/:userId`
- **Method**: `GET`
- **Access**: **Private (logged-in users)**
- **Description**: Retrieve user information by their unique ID.

**Path Parameter**:
  - `userId` (string): Unique identifier of the user.

**Response**:
```json
{
  "success": true,
  "message": "returning single user",
  "data": {
    "id": "user_id",
    "fullname": "User Name",
    "email": "user@example.com",
    "dob": "YYYY-MM-DD",
    "nickname": "nickname",
    "imageUrl": "image_url",
    "phone": "1234567890",
    "isVerified": true,
    "isAdmin": false,
    "isActive": true
  }
}
```

---

### 4. **Activate/Deactivate User**

- **Endpoint**: `/users/:userId/:action`
- **Method**: `POST`
- **Access**: **Admin only**
- **Description**: Activates or deactivates a user account based on the specified action.

**Path Parameters**:
  - `userId` (string): Unique identifier of the user.
  - `action` (string): Either `activate` or `deactivate`.

**Response**:
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "user_id",
    "fullname": "User Name",
    "isActive": true
  }
}
```

---

### 5. **Update User**

- **Endpoint**: `/users/:userId`
- **Method**: `PUT`
- **Access**: **Admin only**
- **Description**: Update user information. Supports profile image uploads.

**Path Parameter**:
  - `userId` (string): Unique identifier of the user.

**Request Body**:
  - Fields to update, such as `fullname`, `email`, etc.
  - **Image file**: Can be uploaded as `profile_img`.

**Response**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_id",
    "fullname": "Updated Name",
    "email": "updated_email@example.com",
    "dob": "YYYY-MM-DD",
    "nickname": "updated_nickname",
    "imageUrl": "new_image_url",
    "phone": "0987654321",
    "isVerified": true,
    "isAdmin": false,
    "isActive": true
  }
}
```

---

### 6. **Delete User**

- **Endpoint**: `/users/:userId`
- **Method**: `DELETE`
- **Access**: **Admin only**
- **Description**: Deletes a user and associated profile image.

**Path Parameter**:
  - `userId` (string): Unique identifier of the user to delete.

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Notes

- **Success Messages**: Each endpoint returns a descriptive success message.
- **Error Handling**: Ensure to handle errors, such as invalid `userId`, missing fields, or unauthorized access.
- **Pagination**: Use the `page` and `limit` query parameters to manage paginated responses.

---

# **Middleware Overview**

- **adminCheck:** Verifies if the user is an admin and their email is verified.
- **checkForMissingFields:** Checks for required fields in the request body and returns an error if any are missing.
- **errorHandler:** Centralizes error handling, returning appropriate status codes and messages for errors.
- **validateToken:** Validates JWT tokens, checks user existence, and ensures the account is active.

--- 

# **Error Handling Overview**  
- **400 Bad Request:** Invalid data input.  
- **401 Unauthorized:** Invalid or missing token.  
- **404 Not Found:** Resource not found.  
- **500 Internal Server Error:** Server-related issues.