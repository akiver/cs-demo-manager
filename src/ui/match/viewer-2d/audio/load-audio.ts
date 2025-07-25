export async function loadAudio(audioFilePath: string) {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('error', (error) => {
      reject(error);
    });
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio);
    });
    audio.src = `file://${audioFilePath}`;
  });
}
