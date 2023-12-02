export function loadImageFromFilePath(imagePath: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', reject);
    image.src = `file://${imagePath}?timestamp=${Date.now()}`;
  });
}
