// libx264 CRF 0 is lossless High 4:4:4 Predictive even with yuv420p. AVI /
// Windows players decode that as heavy blocking. CRF 1 is the lowest value
// that stays on High profile. Other codecs keep 0.
export function getCompatibleConstantRateFactor(constantRateFactor: number, videoCodec: string): number {
  if (constantRateFactor === 0 && videoCodec.trim() === 'libx264') {
    return 1;
  }

  return constantRateFactor;
}
