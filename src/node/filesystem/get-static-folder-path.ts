import path from 'node:path';

export function getStaticFolderPath() {
  // We are in the "out" folder in dev mode and "app.asar" when the app is packaged, so we need to go up one level.
  return path.join(__dirname, '..', 'static');
}
