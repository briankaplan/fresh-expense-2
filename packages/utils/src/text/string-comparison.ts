export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str1.length + 1)
    .fill(null)
    .map(() => Array(str2.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[str1.length][str2.length];
}

export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const distance = calculateLevenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

export function calculateJaccardSimilarity(text1: string, text2: string): number {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  const words1 = new Set(normalize(text1).split(/\s+/));
  const words2 = new Set(normalize(text2).split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}
