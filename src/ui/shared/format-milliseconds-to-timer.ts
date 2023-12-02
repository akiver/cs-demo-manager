/**
 * Transforms milliseconds to a readable timer (minutes + seconds).
 * 80837ms => 1:20
 * 46500ms => 0:47
 */
export function formatMillisecondsToTimer(milliseconds: number) {
  if (milliseconds < 0) {
    return '00:00';
  }

  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
