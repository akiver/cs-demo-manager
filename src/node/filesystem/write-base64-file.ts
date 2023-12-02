import fs from 'fs-extra';

export async function writeBase64File(filePath: string, data: string) {
  await fs.writeFile(filePath, data, 'base64');
}
