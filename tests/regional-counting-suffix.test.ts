import { describe, it, expect } from 'vitest';
import { regionalCountingSuffix } from '../client/src/lib/units/regionalCountingSuffix';

describe('regionalCountingSuffix', () => {
  it('returns space-prefixed word for South Asian units', () => {
    expect(regionalCountingSuffix('lakh')).toBe(' lakh');
    expect(regionalCountingSuffix('crore')).toBe(' crore');
    expect(regionalCountingSuffix('arab')).toBe(' arab');
    expect(regionalCountingSuffix('kharab')).toBe(' kharab');
  });

  it('returns CJK symbol without space for East Asian units', () => {
    expect(regionalCountingSuffix('wan')).toBe('万');
    expect(regionalCountingSuffix('yi')).toBe('亿');
    expect(regionalCountingSuffix('oku')).toBe('億');
  });

  it('returns empty string for non-regional units', () => {
    expect(regionalCountingSuffix('number')).toBe('');
    expect(regionalCountingSuffix('myriad')).toBe('');
    expect(regionalCountingSuffix('percent')).toBe('');
    expect(regionalCountingSuffix('')).toBe('');
  });

  it('formats like "2.5 crore" when appended to a value', () => {
    expect(`2.5${regionalCountingSuffix('crore')}`).toBe('2.5 crore');
    expect(`3.2${regionalCountingSuffix('yi')}`).toBe('3.2亿');
  });
});
