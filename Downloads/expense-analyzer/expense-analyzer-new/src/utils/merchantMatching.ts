'use client';

import { deburr } from 'lodash';

// Common merchant name patterns to normalize
const COMMON_SUFFIXES = [
  'inc', 'llc', 'ltd', 'corp', 'corporation', 'co', 'company',
  'international', 'intl', 'usa', 'us', 'na', 'group', 'holdings',
  'services', 'service', 'solutions', 'tech', 'technology'
] as const;

const COMMON_PREFIXES = ['the', 'www', 'http', 'https'] as const;

const COMMON_WORDS = ['and', '&', 'of', 'by', 'for', 'in', 'at', 'on'] as const;

// Common abbreviations and their expansions
const ABBREVIATIONS: Readonly<Record<string, readonly string[]>> = {
  'rest': ['restaurant', 'restaurants'],
  'cafe': ['coffee', 'café', 'caffe'],
  'intl': ['international'],
  'tech': ['technology', 'technologies'],
  'svcs': ['services'],
  'sys': ['systems'],
  'grp': ['group'],
  'mkt': ['market', 'marketplace'],
  'dept': ['department'],
  'ctr': ['center', 'centre'],
} as const;

interface MerchantMatchOptions {
  maxLevenshteinDistance?: number;
  minSubstringLength?: number;
  ignoreCase?: boolean;
  ignoreSpaces?: boolean;
  ignoreSpecialChars?: boolean;
}

export function normalizeMerchantName(
  name: string, 
  options: MerchantMatchOptions = {}
): string[] {
  const {
    ignoreCase = true,
    ignoreSpaces = true,
    ignoreSpecialChars = true,
  } = options;

  // Start with basic cleaning
  let normalized = deburr(name);
  
  if (ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (ignoreSpecialChars) {
    normalized = normalized.replace(/[^a-z0-9\s]/gi, ' ');
  }
  
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Remove common prefixes and suffixes
  const words = normalized.split(' ').filter(word => 
    !COMMON_SUFFIXES.includes(word as any) &&
    !COMMON_PREFIXES.includes(word as any) &&
    !COMMON_WORDS.includes(word as any)
  );

  // Generate variations
  const variations = new Set<string>();
  
  // Add the main normalized version
  variations.add(words.join(ignoreSpaces ? '' : ' '));

  // Handle common abbreviations
  words.forEach(word => {
    const expansions = ABBREVIATIONS[word];
    if (expansions) {
      expansions.forEach(expansion => {
        const newWords = [...words];
        const index = newWords.indexOf(word);
        if (index !== -1) {
          newWords[index] = expansion;
          variations.add(newWords.join(ignoreSpaces ? '' : ' '));
        }
      });
    }
  });

  // Handle special cases
  if (name.includes('*')) {
    // Handle card processor formatting (e.g., "SQ *BUSINESS NAME" -> "BUSINESS NAME")
    variations.add(normalized.split('*').pop()?.trim() || normalized);
  }

  // Handle numbers in names
  variations.add(normalized.replace(/\d+/g, ''));

  return Array.from(variations);
}

export function areMerchantsRelated(
  merchant1: string, 
  merchant2: string,
  options: MerchantMatchOptions = {}
): boolean {
  const {
    maxLevenshteinDistance = 2,
    minSubstringLength = 5
  } = options;

  const variations1 = normalizeMerchantName(merchant1, options);
  const variations2 = normalizeMerchantName(merchant2, options);

  // Check for direct matches between any variations
  for (const v1 of variations1) {
    for (const v2 of variations2) {
      if (v1 === v2) return true;
      
      // Check for substring matches
      if (v1.length >= minSubstringLength && v2.length >= minSubstringLength) {
        if (v1.includes(v2) || v2.includes(v1)) return true;
      }

      // Calculate Levenshtein distance for similar names
      if (calculateLevenshteinDistance(v1, v2) <= maxLevenshteinDistance) {
        return true;
      }
    }
  }

  return false;
}

// Helper function to calculate Levenshtein distance
function calculateLevenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) [s1, s2] = [s2, s1];

  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(
            Math.min(newValue, lastValue),
            costs[j]
          ) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
} 