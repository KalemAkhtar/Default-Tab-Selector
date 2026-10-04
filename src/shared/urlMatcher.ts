import type { CategoryConfig } from './types';

function segmentsOf(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function patternMatchesAt(patternSegments: string[], pathSegments: string[], start: number): boolean {
  return patternSegments.every((segment, i) => {
    const pathSegment = pathSegments[start + i];
    if (segment === '*') return Boolean(pathSegment);
    return pathSegment?.toLowerCase() === segment.toLowerCase();
  });
}

function patternMatches(pattern: string, pathname: string): boolean {
  const patternSegments = segmentsOf(pattern);
  const pathSegments = segmentsOf(pathname);
  if (patternSegments.length > pathSegments.length) return false;

  for (let start = 0; start <= pathSegments.length - patternSegments.length; start += 1) {
    if (patternMatchesAt(patternSegments, pathSegments, start)) return true;
  }
  return false;
}

/**
 * Finds which configured category applies to the current URL. When more than
 * one pattern matches — e.g. "/entities" also matches "/entities/{id}/fields"
 * the longest pattern is chosen, so in this case Columns is chosen over Tables
 */
export function matchCategory(pathname: string, categories: CategoryConfig[]): CategoryConfig | null {
  const matches = categories.filter((category) => patternMatches(category.urlPattern, pathname));
  if (matches.length === 0) return null;

  matches.sort((a, b) => segmentsOf(b.urlPattern).length - segmentsOf(a.urlPattern).length);
  return matches[0];
}
