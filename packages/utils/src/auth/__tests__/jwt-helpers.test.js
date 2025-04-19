Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const jwt_helpers_1 = require("../jwt-helpers");
(0, vitest_1.describe)("JWT Helpers", () => {
  const testSecret = "test-secret";
  const testUserId = "123";
  (0, vitest_1.describe)("generateToken", () => {
    (0, vitest_1.it)("should generate a valid JWT token", () => {
      const token = (0, jwt_helpers_1.generateToken)({ userId: testUserId }, testSecret, {
        expiresIn: "1h",
      });
      (0, vitest_1.expect)(token).toBeDefined();
      (0, vitest_1.expect)(typeof token).toBe("string");
    });
    (0, vitest_1.it)("should throw error if secret is missing", () => {
      (0, vitest_1.expect)(() =>
        (0, jwt_helpers_1.generateToken)({ userId: testUserId }, "", {
          expiresIn: "1h",
        }),
      ).toThrow("JWT secret is required");
    });
  });
  (0, vitest_1.describe)("verifyToken", () => {
    (0, vitest_1.it)("should verify and decode a valid token", () => {
      const token = (0, jwt_helpers_1.generateToken)({ userId: testUserId }, testSecret, {
        expiresIn: "1h",
      });
      const decoded = (0, jwt_helpers_1.verifyToken)(token, testSecret);
      (0, vitest_1.expect)(decoded).toBeDefined();
      (0, vitest_1.expect)(decoded.userId).toBe(testUserId);
    });
    (0, vitest_1.it)("should throw error if token is missing", () => {
      (0, vitest_1.expect)(() => (0, jwt_helpers_1.verifyToken)("", testSecret)).toThrow(
        "Token is required",
      );
    });
    (0, vitest_1.it)("should throw error if secret is missing", () => {
      const token = (0, jwt_helpers_1.generateToken)({ userId: testUserId }, testSecret, {
        expiresIn: "1h",
      });
      (0, vitest_1.expect)(() => (0, jwt_helpers_1.verifyToken)(token, "")).toThrow(
        "JWT secret is required",
      );
    });
  });
  (0, vitest_1.describe)("generateEmailVerificationToken", () => {
    (0, vitest_1.it)("should generate a valid email verification token", () => {
      const token = (0, jwt_helpers_1.generateEmailVerificationToken)(testUserId, testSecret);
      const decoded = (0, jwt_helpers_1.verifyToken)(token, testSecret);
      (0, vitest_1.expect)(decoded).toBeDefined();
      (0, vitest_1.expect)(decoded.userId).toBe(testUserId);
    });
  });
  (0, vitest_1.describe)("generatePasswordResetToken", () => {
    (0, vitest_1.it)("should generate a valid password reset token", () => {
      const token = (0, jwt_helpers_1.generatePasswordResetToken)(testUserId, testSecret);
      const decoded = (0, jwt_helpers_1.verifyToken)(token, testSecret);
      (0, vitest_1.expect)(decoded).toBeDefined();
      (0, vitest_1.expect)(decoded.userId).toBe(testUserId);
    });
  });
});
//# sourceMappingURL=jwt-helpers.test.js.map
