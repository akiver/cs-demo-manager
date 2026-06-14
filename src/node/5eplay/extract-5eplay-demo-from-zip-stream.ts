import fs from 'node:fs';
import unzipper from 'unzipper';

export async function extract5EPlayDemoFromZipStream(
  zipStream: NodeJS.ReadableStream,
  outputPath: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let demoEntryFound = false;

    const settleResolve = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    const settleReject = (error: Error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    const parser = zipStream.pipe(unzipper.Parse());

    parser.on('entry', (entry: unzipper.Entry) => {
      const isDemoFile = entry.path.toLowerCase().endsWith('.dem');

      if (isDemoFile && !demoEntryFound) {
        demoEntryFound = true;
        entry.pipe(fs.createWriteStream(outputPath)).on('finish', settleResolve).on('error', settleReject);
      } else {
        entry.autodrain();
      }
    });

    parser.on('error', settleReject);
    parser.on('close', () => {
      if (!demoEntryFound) {
        settleReject(new Error('No .dem file found in zip archive'));
      }
    });

    zipStream.on('error', settleReject);
  });
}
