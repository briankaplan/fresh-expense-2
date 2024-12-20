export async function processReceipt(file: File): Promise<string> {
  try {
    // TODO: Implement actual receipt processing
    // This is a mock implementation that just returns a data URL
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Failed to process receipt:', error);
    throw new Error('Failed to process receipt');
  }
} 