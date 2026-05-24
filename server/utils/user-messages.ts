/**
 * User-friendly error messages for API responses.
 * All messages are tailored for non-technical end users.
 * Technical details are logged separately for debugging.
 */

export const USER_MESSAGES = {
  // Authentication & Authorization
  AUTH: {
    TOKEN_REQUIRED: 'Please log in to continue.',
    TOKEN_INVALID: 'Your session has expired. Please log in again.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You don\'t have permission to perform this action.',
    LOGIN_FAILED: 'Unable to log in. Please check your email and password.',
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    TEACHER_NOT_FOUND: 'Account not found. Please check your email.',
    TEACHER_ALREADY_EXISTS: 'This email is already registered. Please log in or use a different email.',
    OTP_INVALID: 'The verification code is incorrect or has expired.',
    OTP_EXPIRED: 'The verification code has expired. Please request a new one.',
    SIGNUP_FAILED: 'Unable to create your account. Please try again later.',
    ACCOUNT_NOT_FOUND: 'Your account doesn\'t exist. Please contact support.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  },

  // Validation errors - Input validation
  VALIDATION: {
    MISSING_FIELDS: 'Please fill in all required fields.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_DATE: 'Please enter a valid date.',
    INVALID_STUDENT_CODE: 'Invalid student code format.',
    INVALID_PARENT_EMAIL: 'Please enter a valid parent email address.',
    INVALID_DATE_OF_BIRTH: 'Please enter a valid date of birth.',
    DUPLICATE_STUDENT_CODE: 'This student code is already registered.',
    DUPLICATE_EMAIL: 'This email is already in use.',
    INVALID_SCORE: 'Please enter a valid score.',
    INVALID_REQUEST: 'Please check your information and try again.',
  },

  // Student operations
  STUDENT: {
    REGISTER_FAILED: 'Unable to register student. Please try again.',
    FETCH_FAILED: 'Unable to load student information. Please try again.',
    NOT_FOUND: 'Student not found.',
    UPDATE_FAILED: 'Unable to update student. Please try again.',
  },

  // Marks operations
  MARKS: {
    SAVE_FAILED: 'Unable to save marks. Please try again.',
    UPDATE_FAILED: 'Unable to update marks. Please try again.',
    FETCH_FAILED: 'Unable to load marks. Please try again.',
    NOT_FOUND: 'Marks not found.',
  },

  // Assignment operations
  ASSIGNMENT: {
    CREATE_FAILED: 'Unable to create assessment. Please try again.',
    FETCH_FAILED: 'Unable to load assessments. Please try again.',
    NOT_FOUND: 'Assessment not found.',
    UPDATE_FAILED: 'Unable to update assessment. Please try again.',
  },

  // Reports operations
  REPORTS: {
    GENERATE_FAILED: 'Unable to generate report. Please try again.',
    FETCH_FAILED: 'Unable to load reports. Please try again.',
    NOT_FOUND: 'Report not found.',
    PRINT_FAILED: 'Unable to prepare report for printing. Please try again.',
    DOWNLOAD_FAILED: 'Unable to download report. Please try again.',
    EMAIL_FAILED: 'Unable to send report via email. Please try again.',
    INVALID_TYPE: 'Invalid report type selected.',
  },

  // Analytics operations
  ANALYTICS: {
    FETCH_FAILED: 'Unable to load analytics. Please try again.',
    INVALID_FILTERS: 'Invalid filter selections. Please try again.',
  },

  // General errors
  GENERAL: {
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    NOT_FOUND: 'The requested item was not found.',
    INVALID_REQUEST: 'Please check your information and try again.',
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
    FILE_NOT_FOUND: 'File not found.',
    PERMISSION_DENIED: 'You don\'t have permission to perform this action.',
    RESOURCE_CONFLICT: 'This resource is already in use. Please try again.',
  },
} as const;

/**
 * Get a user-friendly message based on error context
 */
export function getUserFriendlyMessage(
  category: keyof typeof USER_MESSAGES,
  key: string,
  defaultMessage?: string
): string {
  const categoryMessages = USER_MESSAGES[category];
  if (!categoryMessages) {
    return defaultMessage || USER_MESSAGES.GENERAL.SERVER_ERROR;
  }

  const message = (categoryMessages as Record<string, string>)[key];
  return message || defaultMessage || USER_MESSAGES.GENERAL.SERVER_ERROR;
}

/**
 * Create a standardized API error response with user-friendly message
 */
export function createApiErrorResponse(
  category: keyof typeof USER_MESSAGES,
  key: string,
  statusCode: number,
  defaultMessage?: string,
  internalDetails?: unknown
) {
  const userMessage = getUserFriendlyMessage(category, key, defaultMessage);
  
  const response: Record<string, unknown> = {
    statusCode,
    response: {
      success: false,
      message: userMessage,
    },
  };
  
  if (internalDetails) {
    response.internalDetails = internalDetails;
  }
  
  return response;
}
