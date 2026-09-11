# AgriMark REST API Specification

## Base URL
`/api/v1`

## Authentication
Bearer token authentication using JWT in the `Authorization` HTTP Header:
`Authorization: Bearer <access_token>`

## Stage 1 Implemented Endpoints

### 1. Health Check
- **`GET /api/v1/health`**
  - **Description**: Returns API health status, version, environment, and database connectivity.
  - **Response 200 OK**:
    ```json
    {
      "status": "ok",
      "version": "1.0.0",
      "environment": "development",
      "database": "healthy",
      "timestamp": "2026-09-11T10:00:00.000Z"
    }
    ```

### 2. Authentication & Profile
- **`POST /api/v1/auth/register`**
  - **Description**: Register a new farmer or buyer user account.
  - **Request Body**:
    ```json
    {
      "phone": "9876543210",
      "email": "farmer@example.com",
      "password": "securepassword123",
      "full_name": "Ramesh Kumar",
      "role_name": "farmer",
      "preferred_language": "hi"
    }
    ```
  - **Response 201 Created**: User Object with assigned role.

- **`POST /api/v1/auth/login`**
  - **Description**: Authenticate via phone number or email and password.
  - **Request Body**:
    ```json
    {
      "phone_or_email": "9876543210",
      "password": "securepassword123"
    }
    ```
  - **Response 200 OK**: JWT Bearer token and user details.

- **`GET /api/v1/auth/me`**
  - **Description**: Retrieve current authenticated user's profile.
  - **Headers**: `Authorization: Bearer <token>`
  - **Response 200 OK**: User Profile object.
