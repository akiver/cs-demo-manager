import { describe, expect, it } from 'vite-plus/test';
import { escapeIdentifier } from './create-database-if-not-exists';

describe('escapeIdentifier', () => {
  it('should quote the identifier', () => {
    expect(escapeIdentifier('csdm')).toBe('"csdm"');
  });

  it('should double the quotes inside the identifier', () => {
    expect(escapeIdentifier('cs"dm')).toBe('"cs""dm"');
  });

  it('should not let an identifier escape the quotes', () => {
    expect(escapeIdentifier('a"; DROP DATABASE csdm; --')).toBe('"a""; DROP DATABASE csdm; --"');
  });
});
