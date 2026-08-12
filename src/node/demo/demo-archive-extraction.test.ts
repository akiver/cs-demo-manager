import { describe, expect, it } from 'vite-plus/test';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import fs from 'node:fs/promises';
import { extractDemosFromArchive, getDemosToExtractFromArchive } from './demo-archive-extraction';

describe('Demo archive extraction', () => {
  const demoContent = 'PBDEMS2 fake demo content';

  // Creates the archive in a temporary folder deleted once the test is done, whether it succeeded or not.
  async function withArchive(fileName: string, bytes: Buffer, test: (archivePath: string) => Promise<void>) {
    const folderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'csdm-archive-'));
    try {
      const archivePath = path.join(folderPath, fileName);
      await fs.writeFile(archivePath, bytes);
      await test(archivePath);
    } finally {
      await fs.rm(folderPath, { recursive: true, force: true });
    }
  }

  it('given a .zst archive, when listing its demos, then the demo is queued next to the archive', async () => {
    // Given
    const archiveBytes = zlib.zstdCompressSync(Buffer.from(demoContent));

    await withArchive('match.dem.zst', archiveBytes, async (archivePath) => {
      // When
      const demosToExtract = await getDemosToExtractFromArchive(archivePath);

      // Then
      expect(demosToExtract).toHaveLength(1);
      expect(demosToExtract[0].destinationPath).toBe(archivePath.slice(0, -'.zst'.length));
    });
  });

  it('given a .zst archive, when extracting it, then the demo is decompressed', async () => {
    // Given
    const archiveBytes = zlib.zstdCompressSync(Buffer.from(demoContent));

    await withArchive('match.dem.zst', archiveBytes, async (archivePath) => {
      // When
      const demosToExtract = await getDemosToExtractFromArchive(archivePath);
      await extractDemosFromArchive(archivePath, demosToExtract);

      // Then
      const extractedContent = await fs.readFile(demosToExtract[0].destinationPath, 'utf8');
      expect(extractedContent).toBe(demoContent);
    });
  });

  it('given a .gz archive, when extracting it, then the demo is decompressed', async () => {
    // Given
    const archiveBytes = zlib.gzipSync(Buffer.from(demoContent));

    await withArchive('match.dem.gz', archiveBytes, async (archivePath) => {
      // When
      const demosToExtract = await getDemosToExtractFromArchive(archivePath);
      await extractDemosFromArchive(archivePath, demosToExtract);

      // Then
      const extractedContent = await fs.readFile(demosToExtract[0].destinationPath, 'utf8');
      expect(extractedContent).toBe(demoContent);
    });
  });

  it('given a .zst archive that does not hold a demo, when listing its demos, then nothing is queued', async () => {
    // Given
    const archiveBytes = zlib.zstdCompressSync(Buffer.from(demoContent));

    await withArchive('notes.txt.zst', archiveBytes, async (archivePath) => {
      // When
      const demosToExtract = await getDemosToExtractFromArchive(archivePath);

      // Then
      expect(demosToExtract).toHaveLength(0);
    });
  });

  it('given a .zst archive already extracted, when listing its demos, then nothing is queued', async () => {
    // Given
    const archiveBytes = zlib.zstdCompressSync(Buffer.from(demoContent));

    await withArchive('match.dem.zst', archiveBytes, async (archivePath) => {
      await fs.writeFile(archivePath.slice(0, -'.zst'.length), demoContent);

      // When
      const demosToExtract = await getDemosToExtractFromArchive(archivePath);

      // Then
      expect(demosToExtract).toHaveLength(0);
    });
  });

  it('given a corrupted .zst archive, when extracting it, then it throws and leaves no temporary file', async () => {
    // Given
    const archiveBytes = Buffer.from('not a zstd archive');

    await withArchive('match.dem.zst', archiveBytes, async (archivePath) => {
      // When
      const demosToExtract = await getDemosToExtractFromArchive(archivePath);
      const extraction = extractDemosFromArchive(archivePath, demosToExtract);

      // Then
      await expect(extraction).rejects.toThrow();
      const fileNames = await fs.readdir(path.dirname(archivePath));
      expect(fileNames).toStrictEqual(['match.dem.zst']);
    });
  });
});
