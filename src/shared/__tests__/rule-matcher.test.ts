import { describe, expect, it } from 'vitest';
import { matchRule } from '../rule-matcher';
import type { HighlightRule } from '../types';

function makeRule(overrides: Partial<HighlightRule>): HighlightRule {
  return {
    id: 'id',
    name: 'name',
    enabled: true,
    urlPattern: '*://example.com/*',
    priority: 1,
    highlight: { type: 'bar', color: '#000000' },
    ...overrides,
  };
}

describe('matchRule', () => {
  it('retorna a regra de maior prioridade (menor número) entre as que casam', () => {
    const low = makeRule({ id: 'low', priority: 2 });
    const high = makeRule({ id: 'high', priority: 1 });
    expect(matchRule('https://example.com/', [low, high])?.id).toBe('high');
  });

  it('em empate de priority, retorna a primeira do array de entrada', () => {
    const first = makeRule({ id: 'first', priority: 1 });
    const second = makeRule({ id: 'second', priority: 1 });
    expect(matchRule('https://example.com/', [first, second])?.id).toBe('first');
  });

  it('ignora regras desabilitadas, retornando null se for a única candidata', () => {
    const disabled = makeRule({ id: 'disabled', enabled: false });
    expect(matchRule('https://example.com/', [disabled])).toBeNull();
  });

  it('retorna null quando nenhuma regra casa', () => {
    const rule = makeRule({ urlPattern: '*://other.com/*' });
    expect(matchRule('https://example.com/', [rule])).toBeNull();
  });

  it('retorna null para lista de regras vazia', () => {
    expect(matchRule('https://example.com/', [])).toBeNull();
  });
});
