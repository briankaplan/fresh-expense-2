Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const itty_router_1 = require("itty-router");
const expenses_1 = require("./handlers/expenses");
const files_1 = require("./handlers/files");
const health_1 = require("./handlers/health");
const webhooks_1 = require("./handlers/webhooks");
const auth_1 = require("./middleware/auth");
const cors_1 = require("./middleware/cors");
exports.router = (0, itty_router_1.Router)();
// Apply middleware
exports.router.all("*", cors_1.handleCors);
exports.router.all("/api/*", auth_1.handleAuth);
// Health check endpoint
exports.router.get("/health", health_1.handleHealth);
// API routes
exports.router.get("/api/expenses", expenses_1.handleExpenses);
exports.router.post("/api/expenses", expenses_1.handleExpenses);
exports.router.get("/api/expenses/:id", expenses_1.handleExpenses);
exports.router.put("/api/expenses/:id", expenses_1.handleExpenses);
exports.router.delete("/api/expenses/:id", expenses_1.handleExpenses);
// File upload/download routes
exports.router.post("/api/files", files_1.handleFiles);
exports.router.get("/api/files/:id", files_1.handleFiles);
exports.router.delete("/api/files/:id", files_1.handleFiles);
// Webhook routes
exports.router.post("/webhooks/teller", webhooks_1.handleWebhooks);
// 404 handler
exports.router.all("*", () => new Response("Not Found", { status: 404 }));
//# sourceMappingURL=routes.js.map
