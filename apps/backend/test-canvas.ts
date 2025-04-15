import { createCanvas } from 'canvas';

const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, 100, 100);

console.log('Canvas rendered without crashing!');
