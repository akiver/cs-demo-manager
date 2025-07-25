const key = '2d-audio-offset';

// The offset is stored in seconds, can be negative or positive
export function getDemoAudioOffset(checksum: string) {
  const offset = window.localStorage.getItem(`${key}-${checksum}`);

  return offset ? parseFloat(offset) : 0;
}

export function deleteDemoAudioOffset(checksum: string) {
  window.localStorage.removeItem(`${key}-${checksum}`);
}

export function persistDemoAudioOffset(checksum: string, offset: number) {
  window.localStorage.setItem(`${key}-${checksum}`, String(offset));
}
