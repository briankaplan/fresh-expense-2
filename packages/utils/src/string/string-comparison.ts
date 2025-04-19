/**
 * String comparison utilities for matching and normalizing text
 */

/**
 * Normalize text by converting to lowercase, removing special characters,
 * and standardizing whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Calculate the Levenshtein distance between two strings
 * Returns a number representing the number of edits needed to transform str1 into str2
 */
export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill the dp table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0 to 1)
 * 1 means strings are identical, 0 means completely different
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const matrix = Array(str1.length + 1)
    .fill(null)
    .map(() => Array(str2.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const distance = matrix[str1.length][str2.length];
  return 1 - distance / Math.max(str1.length, str2.length);
}

/**
 * Check if two strings are similar enough based on a threshold
 */
export function areSimilarStrings(str1: string, str2: string, threshold = 0.8): boolean {
  return calculateStringSimilarity(str1, str2) >= threshold;
}

/**
 * Calculates Jaccard similarity between two texts (0-1)
 */
export function calculateJaccardSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

  const words1 = new Set(normalize(text1).split(/\s+/).filter(Boolean));
  const words2 = new Set(normalize(text2).split(/\s+/).filter(Boolean));

  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
