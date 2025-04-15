/**
 * Generate HTML content for verification email
 */
export function generateVerificationEmailContent(verificationLink: string): string {
  return `
    <h1>Welcome to Fresh Expense!</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `;
}

/**
 * Generate HTML content for password reset email
 */
export function generatePasswordResetEmailContent(resetLink: string): string {
  return `
    <h1>Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
}

/**
 * Generate verification link with token
 */
export function generateVerificationLink(baseUrl: string, token: string): string {
  return `${baseUrl}/verify-email?token=${token}`;
}

/**
 * Generate password reset link with token
 */
export function generatePasswordResetLink(baseUrl: string, token: string): string {
  return `${baseUrl}/reset-password?token=${token}`;
}
