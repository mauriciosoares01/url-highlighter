import { describe, expect, it } from 'vitest';
import { globToRegExp } from '../glob';

describe('globToRegExp', () => {
  it('casa subdomínios de staging com wildcard no meio do hostname', () => {
    const regex = globToRegExp('*://staging.*.example.com/*');
    expect(regex.test('https://staging.tenant-a.example.com/dashboard')).toBe(true);
    expect(regex.test('http://staging.tenant-b.example.com/')).toBe(true);
  });

  it('não casa domínio sem o segmento staging', () => {
    const regex = globToRegExp('*://staging.*.example.com/*');
    expect(regex.test('https://app.example.com/dashboard')).toBe(false);
  });

  it('respeita porta exata quando especificada', () => {
    const regex = globToRegExp('*://localhost:5501/*');
    expect(regex.test('http://localhost:5501/qualquer/caminho?x=1')).toBe(true);
    expect(regex.test('http://localhost:5502/')).toBe(false);
  });

  it('casa qualquer porta quando usado wildcard na porta', () => {
    const regex = globToRegExp('*://localhost:*/*');
    expect(regex.test('http://localhost:5501/')).toBe(true);
    expect(regex.test('http://localhost:5502/')).toBe(true);
    expect(regex.test('http://localhost:443/')).toBe(true);
  });
});
