export function loadImageFromFilePath(imagePath: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', reject);
    const src = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;
    image.src = `${src}?timestamp=${Date.now()}`;
  });
}
