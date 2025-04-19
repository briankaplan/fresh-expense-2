/**
 * Generate a unique ID
 * @returns A unique ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
