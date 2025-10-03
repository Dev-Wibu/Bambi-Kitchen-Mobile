# Authentication Pages

This folder contains the authentication pages for the React Native Expo application.

## Pages

### 1. Login Page (`login.tsx`)

- **Route**: `/login`
- **Features**:
  - Email input field
  - Password input field with show/hide toggle
  - "Forgot Password" link
  - "Login" button with loading state
  - Link to registration page
  - App logo at the top
  - Decorative image at the bottom
  - Responsive dark mode support
  - English language interface
  - Toast notifications for success/error messages
  - Integration with AuthContext for session management

### 2. Register Page (`register.tsx`)

- **Route**: `/register`
- **Features**:
  - Full name input field
  - Email input field
  - Phone number input field (optional)
  - Password input field with show/hide toggle
  - Confirm password input field with show/hide toggle
  - "Register" button with loading state
  - Link to login page
  - App logo at the top
  - Decorative image at the bottom
  - Responsive dark mode support
  - English language interface
  - Form validation
  - Toast notifications for success/error messages
  - Auto-navigation to login after successful registration

## Authentication Implementation

### Backend API Integration

The authentication is integrated with the Spring Boot backend:

- **Login Endpoint**: `POST /login` (Spring Security form-based auth)
- **Register Endpoint**: `POST /api/account` (Account creation)
- **User Info**: `GET /api/user/me` (Get authenticated user details)
- **Authentication Method**: Session-based (cookies)

### Data Flow

#### Login Flow:

1. User enters email and password
2. App sends form data to `/login` endpoint
3. On success, fetch user info from `/api/user/me`
4. Save user data to AsyncStorage
5. Update AuthContext state
6. Navigate to main app

#### Register Flow:

1. User fills registration form
2. Validate password match and field requirements
3. Send account data to `/api/account`
4. On success, show toast notification
5. Clear form fields
6. Navigate to login page

### AuthContext Integration

Both pages use the `useAuth()` hook from `@/hooks/useAuth` which provides:

- `login(email, password)`: Authenticate user
- `logout()`: Clear session and user data
- `isLoggedIn`: Boolean authentication state
- `user`: Current user data (userId, name, role)
- `isLoading`: Loading state

## Security Considerations

- Passwords are never stored locally
- Session cookies are handled by the backend
- AsyncStorage only stores non-sensitive user info (userId, name, role)
- HTTPS is required for production API calls
- Password minimum length: 6 characters

## Testing

To test the authentication:

1. **Register a new account**:
   - Name: Test User
   - Email: test@example.com
   - Phone: +84123456789 (optional)
   - Password: password123

2. **Login with credentials**:
   - Email: test@example.com
   - Password: password123

3. **Check AsyncStorage**:
   - User data should be persisted
   - App should remember login state on restart
