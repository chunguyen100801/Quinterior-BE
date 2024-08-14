export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  LOGIN_SUCCESSFUL: 'Login successful',
  REGISTER_SUCCESSFUL: 'Register successful',
  USER_NOT_FOUND: 'User not found',
  USER_IS_TAKEN: 'User is taken',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  VERIFY_EMAIL_SUCCESSFULLY: 'Verify email successfully',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  USER_LOGGED_OUT: 'User logged out',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  PASSWORD_OR_USERNAME_INCORRECT: 'Password or username is incorrect',
  UPDATE_PROFILE_SUCCESSFULLY: 'Update profile successfully',
  DELETE_USER_SUCCESSFULLY: 'Delete user successfully',
  VERIFY_TOKEN_BEFORE_LOGIN: 'Please verify token before login ',
  PASSWORD_NOT_MATCH: 'Password not match',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_A_PASSWORD:
    'Confirm password must be the same as password',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  RESEND_VERIFY_EMAIL_SUCCESSFULLY: 'Resend verify email successfully',
  VERIFY_STATUS_INCORRECT: 'Verify status incorrect',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check mail to reset password',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token invalid',
  RESET_PASSWORD_SUCCESSFUL: 'Reset password successful',
  ACCOUNT_IS_VERIFIED: 'Account is verified, cant verify again',
  USER_IS_BANNED: 'User is banned',
  GET_USERS_LIST_SUCCESSFULLY: 'Get users successfully',
  MAXIMUM_NUMBER_OF_USER: 'Maximum number of user',
} as const;

export const TOKEN_MESSAGES = {
  TOKEN_IS_EXPIRED: 'Token is expired',
  TOKEN_IS_BLACKLIST: 'Token is blacklist',
  TOKEN_IS_INVALID: 'Token is invalid',
};

export const AUTHORIZATION_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  DO_NOT_HAVE_PERMISSION_TO_ACCESS_THIS_RESOURCE:
    'You do not have permission to access this resource',
};

export const NOTIFICATION_MESSAGES = {
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  GET_NOTIFICATIONS_SUCCESSFULLY: 'Get notifications successfully',
  GET_NOTIFICATION_BY_ID_SUCCESSFULLY: 'Get notification by id successfully',
  MARK_AS_READ_SUCCESSFULLY: 'Mark as read successfully',
};

export const TOKEN_KEY_MESSAGES = {
  TOKEN_KEY_NOT_FOUND: 'Token key not found',
};
