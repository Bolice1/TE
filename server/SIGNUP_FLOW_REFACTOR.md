/**
 * STAGED SIGNUP FLOW REFACTOR - INTEGRATION TEST GUIDE
 * 
 * This file documents the refactored 3-step signup flow that matches
 * the frontend architecture. The backend now issues temporary signup tokens
 * instead of passing OTP through the final signup request.
 */

/**
 * STEP 1: Request OTP
 * 
 * POST /api/auth/signup/initiate
 * 
 * Request:
 * {
 *   "email": "teacher@example.com"
 * }
 * 
 * Backend responsibilities:
 * - Validate email format
 * - Normalize to lowercase
 * - Check if teacher already exists (REJECT if exists)
 * - Generate 6-digit OTP
 * - Store OTP with 5-minute expiration
 * - Send OTP email
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Verification OTP code sent to your email.",
 *   "email": "teacher@example.com",
 *   "expiresAt": "2026-05-24T12:00:00.000Z",
 *   "storage": "mongodb|redis"
 * }
 * 
 * Error Response (409):
 * {
 *   "message": "Teacher already exists."
 * }
 */

/**
 * STEP 2: Verify OTP
 * 
 * POST /api/auth/signup/verify
 * 
 * Request:
 * {
 *   "email": "teacher@example.com",
 *   "otp": "123456"
 * }
 * 
 * Backend responsibilities:
 * - Validate email and OTP provided
 * - Retrieve stored OTP
 * - Compare OTPs (reject if mismatch)
 * - DELETE OTP from storage (consumed)
 * - Generate temporary signup token (hex string, 32 bytes)
 * - Store signup token with 10-15 minute expiration
 * - Return signup token
 * 
 * IMPORTANT: OTP is deleted after verification. It cannot be used again.
 * 
 * Success Response (200):
 * {
 *   "verified": true,
 *   "signupToken": "a1b2c3d4e5f6...",
 *   "message": "OTP verified successfully."
 * }
 * 
 * Error Response (400):
 * {
 *   "message": "Invalid or expired OTP."
 * }
 */

/**
 * STEP 3: Complete Registration
 * 
 * POST /api/auth/signup/complete
 * 
 * Headers:
 * Authorization: Bearer <signupToken>
 * 
 * Request:
 * {
 *   "name": "Teacher Name",
 *   "coachingName": "School Name",
 *   "address": "Kigali",
 *   "phoneNumber": "+250...",
 *   "password": "password123"
 * }
 * 
 * IMPORTANT: OTP is NOT included. Only signup token in Authorization header.
 * 
 * Backend responsibilities (validateSignupToken middleware):
 * - Extract token from Authorization header
 * - Find signup token in database
 * - Verify token is valid and not expired
 * - Extract email from token
 * - Set req.signupEmail and req.signupToken
 * 
 * Backend responsibilities (registerCoach):
 * - Validate all required fields provided
 * - Validate password length >= 8 characters
 * - Hash password with bcrypt
 * - Create Coach document with isEmailVerified: true
 * - Create teacher session
 * - Send welcome email
 * - Delete signup token (consumed)
 * - Log audit event
 * - Return JWT token and authenticated user
 * 
 * Success Response (201):
 * {
 *   "message": "Teacher account created successfully.",
 *   "token": "eyJhbGc...",
 *   "auth": {
 *     "type": "Bearer",
 *     "expiresIn": "1d",
 *     "sessionId": "uuid"
 *   },
 *   "emailDelivery": {
 *     "welcomeDelivered": true
 *   },
 *   "teacher": {
 *     "id": "mongodb-id",
 *     "email": "teacher@example.com",
 *     "name": "Teacher Name",
 *     "coachingName": "School Name",
 *     "address": "Kigali",
 *     "phoneNumber": "+250...",
 *     "isEmailVerified": true
 *   }
 * }
 * 
 * Error Response (401):
 * {
 *   "message": "Invalid or expired signup token. Please verify your email again."
 * }
 */

/**
 * SECURITY FEATURES IMPLEMENTED
 * ============================
 * 
 * 1. OTP Management
 *    - 6-digit random OTP
 *    - 5-minute expiration (300000 ms)
 *    - Deleted after verification (no reuse)
 *    - Email format validation
 * 
 * 2. Signup Token Management
 *    - 32-byte cryptographic token
 *    - 10-15 minute expiration (900000 ms default)
 *    - Stored in MongoDB with TTL index
 *    - One token per email (previous tokens replaced)
 *    - Deleted after account creation
 * 
 * 3. Duplicate Prevention
 *    - Email existence check BEFORE OTP generation
 *    - No OTP sent to existing users
 *    - Double-check before account creation
 * 
 * 4. Email Normalization
 *    - All emails converted to lowercase
 *    - Consistent throughout flow
 * 
 * 5. Audit Logging
 *    - 'teacher_signup' action on success/failure
 *    - Captures email and error details
 * 
 * 6. HTTP Status Codes
 *    - 200: Success
 *    - 201: Account created
 *    - 400: Bad request (validation error)
 *    - 401: Authentication required (invalid token)
 *    - 409: Conflict (duplicate email)
 *    - 503: Service unavailable (email config)
 */

/**
 * DATABASE CHANGES
 * ================
 * 
 * New Collection: SignupToken
 * Fields:
 *   - email (String, lowercase, unique, sparse)
 *   - token (String, unique)
 *   - verified (Boolean, always true for valid tokens)
 *   - expiresAt (Date, TTL index for auto-cleanup)
 *   - createdAt (Date, auto)
 *   - updatedAt (Date, auto)
 * 
 * Indexes:
 *   - TTL on expiresAt (auto-delete expired tokens)
 *   - Compound on (email, expiresAt)
 *   - Compound on (token, expiresAt)
 */

/**
 * FRONTEND INTEGRATION
 * ====================
 * 
 * Page: client/src/app/auth/signup/page.tsx
 * 
 * Step 1: User enters email
 *   - Call: api.auth.requestOtp(email)
 *   - Expected: { message, email, expiresAt, storage }
 *   - Display: OTP sent success message
 * 
 * Step 2: User enters OTP
 *   - Call: api.auth.verifyOtp(email, otp)
 *   - Expected: { verified: true, signupToken }
 *   - Store: signupToken in component state
 *   - Display: Verified success message
 * 
 * Step 3: User completes profile
 *   - Call: signup(signupToken, { name, coachingName, address, phoneNumber, password })
 *   - Header: Authorization: Bearer {signupToken}
 *   - Expected: { token, teacher, auth }
 *   - Save: JWT token to localStorage
 *   - Redirect: /dashboard
 * 
 * API Service Changes:
 *   - api.auth.requestOtp: /auth/signup/initiate
 *   - api.auth.verifyOtp: /auth/signup/verify (returns signupToken)
 *   - api.auth.signup: /auth/signup/complete (accepts signupToken in Authorization header)
 */

export {};
