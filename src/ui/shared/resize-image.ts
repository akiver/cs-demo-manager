export async function resizeImage(image: ImageBitmapSource, width: number) {
  const resizedImage = await createImageBitmap(image, {
    resizeWidth: width,
    resizeQuality: 'high',
  });
  const canvas = document.createElement('canvas');
  canvas.width = resizedImage.width;
  canvas.height = resizedImage.height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(resizedImage, 0, 0);
  const base64 = canvas.toDataURL();

  return base64;
}

export async function resizeImageFromFilePath(imagePath: string, width: number) {
  const buffer = await window.csdm.readImageFile(imagePath);
  const blob = new Blob([buffer]);

  return resizeImage(blob, width);
}
