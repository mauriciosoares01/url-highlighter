import type { HighlightRule } from './types';
import { globToRegExp } from './glob';

export function matchRule(url: string, rules: HighlightRule[]): HighlightRule | null {
  const candidates = rules.filter((r) => r.enabled).sort((a, b) => a.priority - b.priority);
  for (const rule of candidates) {
    if (globToRegExp(rule.urlPattern).test(url)) return rule;
  }
  return null;
}
