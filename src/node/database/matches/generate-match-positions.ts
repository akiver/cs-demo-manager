import { deleteCsvFilesInOutputFolder, getOutputFolderPath } from 'csdm/node/database/matches/match-insertion';
import { CorruptedDemoError } from 'csdm/node/demo-analyzer/corrupted-demo-error';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import { analyzeDemo } from 'csdm/node/demo/analyze-demo';
import { insertMatch } from './insert-match';

type Parameters = {
  checksum: string;
  demoPath: string;
  source: DemoSource;
  onInsertionStart: () => void;
};

export async function generateMatchPositions({ checksum, demoPath, source, onInsertionStart }: Parameters) {
  const outputFolderPath = getOutputFolderPath();

  const processMatchInsertion = async () => {
    onInsertionStart();
    // We insert the full match rather than just the positions because the unique grenade IDs change at each analysis.
    // The grenade positions IDs and the grenade start,end... IDs events would be different if we only insert the positions.
    await insertMatch({
      checksum,
      demoPath,
      outputFolderPath,
    });
  };

  try {
    await analyzeDemo({
      demoPath,
      outputFolderPath,
      source,
      analyzePositions: true,
    });

    await processMatchInsertion();
  } catch (error) {
    // If the demo is corrupted, we still want to try to insert positions in the database.
    if (error instanceof CorruptedDemoError) {
      await processMatchInsertion();
    } else {
      throw error;
    }
  } finally {
    await deleteCsvFilesInOutputFolder(outputFolderPath);
  }
}
