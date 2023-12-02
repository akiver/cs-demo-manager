import type { DemoSource } from 'csdm/common/types/counter-strike';
import { runDemoAnalyzer } from 'csdm/node/demo-analyzer/run-demo-analyzer';
import { assertDemoExists } from 'csdm/node/counter-strike/launcher/assert-demo-exists';

type Options = {
  outputFolderPath: string;
  demoPath: string;
  source: DemoSource;
  analyzePositions: boolean;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
};

export async function analyzeDemo({
  outputFolderPath,
  demoPath,
  source,
  analyzePositions,
  onStdout,
  onStderr,
}: Options) {
  await assertDemoExists(demoPath);

  await runDemoAnalyzer({
    outputFolderPath,
    demoPath,
    source,
    analyzePositions,
    onStart: (command) => {
      logger.log('starting demo analyzer with command', command);
    },
    onStdout: onStdout ?? logger.log,
    onStderr: onStderr ?? logger.error,
    onEnd: (code) => {
      logger.log('demo analyzer exited with code', code);
    },
  });
}
