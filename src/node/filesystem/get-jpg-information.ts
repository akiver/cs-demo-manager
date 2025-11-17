import fs from 'node:fs/promises';
import type { ImageInformation } from 'csdm/common/types/image-information';

// The header part of a JPEG file is divided into segments, and each segment starts with a marker, identifying the segment.
// Dimensions are stored in the SOF (Start Of Frame) segment.
// https://www.go2share.net/article/jpg-file-structure
export async function getJpgInformation(filePath: string): Promise<ImageInformation> {
  const buffer = await fs.readFile(filePath);
  // JPEG signature is 0xFF 0xD8, it's the SOI (Start Of Image) marker
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('Invalid JPEG file');
  }

  let offset = 2; // skip signature
  let width = 0;
  let height = 0;

  while (offset < buffer.length) {
    // a marker always starts with 0xFF
    if (buffer[offset] !== 0xff) {
      throw new Error('Invalid JPEG structure');
    }

    const markerType = buffer[offset + 1];
    offset += 2;

    // SOF marker is in the range 0xC0 to 0xCF (192-207), excluding 0xC4, 0xC8, and 0xCC.
    // https://en.wikibooks.org/wiki/JPEG_-_Idea_and_Practice/The_header_part
    if (
      (markerType >= 0xc0 && markerType <= 0xc3) ||
      (markerType >= 0xc5 && markerType <= 0xc7) ||
      (markerType >= 0xc9 && markerType <= 0xcb) ||
      (markerType >= 0xcd && markerType <= 0xcf)
    ) {
      // skip segment length (2 bytes) and precision (1 byte)
      height = buffer.readUInt16BE(offset + 3);
      width = buffer.readUInt16BE(offset + 5);
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    offset += segmentLength;
  }

  return {
    width,
    height,
    base64: `data:image/jpeg;base64,${buffer.toString('base64')}`,
  };
}
