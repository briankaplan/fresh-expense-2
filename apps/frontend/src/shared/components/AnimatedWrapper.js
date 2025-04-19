"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const AnimatedWrapper = ({ children, delay = 0 }) => {
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{
            duration: 0.4,
            delay,
            ease: [0.25, 0.1, 0.25, 1.0], // Custom easing
        }}>
      {children}
    </framer_motion_1.motion.div>);
};
exports.default = AnimatedWrapper;
//# sourceMappingURL=AnimatedWrapper.js.map