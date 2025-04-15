const { createCanvas } = require('canvas');

try {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // Draw a simple rectangle
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 50, 50);

  console.log('Canvas test successful!');
  console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
} catch (error) {
  console.error('Canvas test failed:', error);
}
