"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("canvas");
const canvas = (0, canvas_1.createCanvas)(200, 200);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, 100, 100);
console.log('Canvas rendered without crashing!');
//# sourceMappingURL=test-canvas.js.map