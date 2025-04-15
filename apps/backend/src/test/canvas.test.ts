import { createCanvas } from 'canvas';

describe('Canvas Test', () => {
  it('should create a canvas and draw on it', () => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');

    // Draw a simple rectangle
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 50, 50);

    // Verify canvas was created
    expect(canvas).toBeDefined();
    expect(ctx).toBeDefined();

    // Verify canvas dimensions
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(200);
  });
});
