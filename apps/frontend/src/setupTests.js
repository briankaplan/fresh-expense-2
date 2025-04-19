"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
const matchers_1 = __importDefault(require("@testing-library/jest-dom/matchers"));
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
vitest_1.expect.extend(matchers_1.default);
(0, vitest_1.afterEach)(() => {
    (0, react_1.cleanup)();
});
//# sourceMappingURL=setupTests.js.map