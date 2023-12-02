import fs from 'node:fs/promises';

type PNGInformation = {
  width: number;
  height: number;
  base64: string;
};

export async function getPngInformation(filePath: string): Promise<PNGInformation> {
  const buffer = await fs.readFile(filePath);
  // https://www.w3.org/TR/2003/REC-PNG-20031110/#5PNG-file-signature
  const headerSignature = [137, 80, 78, 71, 13, 10, 26, 10];

  for (let i = 0; i < headerSignature.length; i++) {
    if (headerSignature[i] !== buffer[i]) {
      throw new Error('Invalid PNG file.');
    }
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    base64: `data:image/png;base64, ${buffer.toString('base64')}`,
  };
}
