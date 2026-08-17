import { describe, expect, it } from 'vite-plus/test';
import { getCompatibleConstantRateFactor } from './get-compatible-constant-rate-factor';

describe('getCompatibleConstantRateFactor', () => {
  it('maps quality 0 to CRF 1 for libx264 so it stays on High profile', () => {
    expect(getCompatibleConstantRateFactor(0, 'libx264')).toBe(1);
  });

  it('keeps quality 0 for codecs other than libx264', () => {
    expect(getCompatibleConstantRateFactor(0, 'libx265')).toBe(0);
    expect(getCompatibleConstantRateFactor(0, 'h264_nvenc')).toBe(0);
  });

  it('keeps 1..51 unchanged', () => {
    expect(getCompatibleConstantRateFactor(1, 'libx264')).toBe(1);
    expect(getCompatibleConstantRateFactor(23, 'libx264')).toBe(23);
    expect(getCompatibleConstantRateFactor(51, 'libx264')).toBe(51);
  });
});
