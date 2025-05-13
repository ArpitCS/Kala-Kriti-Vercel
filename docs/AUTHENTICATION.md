# Kala-Kriti Authentication System

## Password Encryption

This project uses bcryptjs for password encryption. The implementation is simple but effective:

1. **Password Storage**: All passwords are hashed using bcrypt before being stored in the database.
2. **Password Verification**: When users log in, their provided password is compared with the hashed password in the database using bcrypt's compare function.
3. **Security**: Passwords are never stored in plain text, protecting user data in case of a database breach.

## Implementation Details

- **User Model**: The User model includes a pre-save hook that automatically hashes the password whenever it's modified.
- **Authentication Routes**: All authentication-related routes (login, registration, password change) use bcrypt for secure password handling.
- **Migration**: A migration script is provided to hash any existing plain-text passwords in the database.

## Utility Scripts

### Migration Script

After updating to this authentication system, run the password migration script to ensure all existing user passwords are properly hashed:

```bash
npm run migrate-passwords
```

This script checks all users in the database and hashes any plain-text passwords.

### Password Hash Check

To verify that all passwords in the database are properly hashed, run:

```bash
npm run check-passwords
```

This script will check all user accounts and report if any passwords appear to be stored in plain text instead of being properly hashed.

## Password Requirements

The system enforces the following password requirements:

- Minimum 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (e.g., @, $, !, %, *, ?, &)

These requirements are enforced through:
- Server-side validation in the registration route
- Client-side validation using HTML5 pattern attributes and JavaScript
- Visual feedback to users during the registration process

## Security Notes

- The bcrypt implementation uses a salt factor of 10, which is a good balance between security and performance.
- Password comparison is done using the async version of bcrypt.compare for better security and performance.
- JWT tokens are used for session management, with secure HTTP-only cookies.
- Failed login attempts are logged but not rate-limited in the current implementation (consider adding rate limiting for production).
