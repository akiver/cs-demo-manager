import zlib from 'node:zlib';
import bz2 from 'unbzip2-stream';
import { ArchiveFormat, type SingleStreamArchiveFormat } from 'csdm/common/types/archive-format';

// Decompression stream of the archive formats holding a single compressed stream.
// .zip is not handled here, it may hold several files and requires a dedicated reader.
export function createDecompressStream(format: SingleStreamArchiveFormat): NodeJS.ReadWriteStream {
  switch (format) {
    case ArchiveFormat.Gz:
      return zlib.createGunzip();
    case ArchiveFormat.Bz2:
      return bz2();
    case ArchiveFormat.Zst:
      return zlib.createZstdDecompress();
  }
}
