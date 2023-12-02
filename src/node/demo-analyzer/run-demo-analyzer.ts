import path from 'node:path';
import { analyzeDemo, type Options as AnalyzeOptions } from '@akiver/cs-demo-analyzer';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { CorruptedDemoError } from './corrupted-demo-error';

type RunDemoAnalyzerOptions = Omit<AnalyzeOptions, 'format' | 'executablePath'>;

export async function runDemoAnalyzer(
  options: Omit<RunDemoAnalyzerOptions, 'format' | 'executablePath'>,
): Promise<void> {
  const executablePath = path.join(getStaticFolderPath(), isWindows ? 'csda.exe' : 'csda');

  await analyzeDemo({
    ...options,
    executablePath,
    format: 'csdm',
    onStderr: (data) => {
      options.onStderr?.(data);
      if (data.includes('ErrUnexpectedEndOfDemo')) {
        throw new CorruptedDemoError();
      }
    },
  });
}
