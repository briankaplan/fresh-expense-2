Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const email_templates_1 = require("../email-templates");
(0, vitest_1.describe)("Email Templates", () => {
  const baseUrl = "https://example.com";
  const token = "test-token";
  (0, vitest_1.describe)("generateVerificationLink", () => {
    (0, vitest_1.it)("should generate correct verification link", () => {
      const link = (0, email_templates_1.generateVerificationLink)(baseUrl, token);
      (0, vitest_1.expect)(link).toBe(`${baseUrl}/verify-email?token=${token}`);
    });
  });
  (0, vitest_1.describe)("generatePasswordResetLink", () => {
    (0, vitest_1.it)("should generate correct password reset link", () => {
      const link = (0, email_templates_1.generatePasswordResetLink)(baseUrl, token);
      (0, vitest_1.expect)(link).toBe(`${baseUrl}/reset-password?token=${token}`);
    });
  });
  (0, vitest_1.describe)("generateVerificationEmailContent", () => {
    (0, vitest_1.it)("should generate verification email HTML content", () => {
      const link = (0, email_templates_1.generateVerificationLink)(baseUrl, token);
      const content = (0, email_templates_1.generateVerificationEmailContent)(link);
      (0, vitest_1.expect)(content).toContain("Welcome to Fresh Expense!");
      (0, vitest_1.expect)(content).toContain(link);
      (0, vitest_1.expect)(content).toContain("24 hours");
    });
  });
  (0, vitest_1.describe)("generatePasswordResetEmailContent", () => {
    (0, vitest_1.it)("should generate password reset email HTML content", () => {
      const link = (0, email_templates_1.generatePasswordResetLink)(baseUrl, token);
      const content = (0, email_templates_1.generatePasswordResetEmailContent)(link);
      (0, vitest_1.expect)(content).toContain("Password Reset Request");
      (0, vitest_1.expect)(content).toContain(link);
      (0, vitest_1.expect)(content).toContain("1 hour");
      (0, vitest_1.expect)(content).toContain("ignore this email");
    });
  });
});
//# sourceMappingURL=email-templates.test.js.map
