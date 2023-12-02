import { insertMatchPositions } from 'csdm/node/database/matches/insert-match-positions';
import {
  deleteCsvFilesInOutputFolder,
  getDemoNameFromPath,
  getOutputFolderPath,
} from 'csdm/node/database/matches/match-insertion';
import { getSettings } from 'csdm/node/settings/get-settings';
import { CorruptedDemoError } from 'csdm/node/demo-analyzer/corrupted-demo-error';
import { deleteMatchPositions } from 'csdm/node/database/matches/delete-match-positions';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import { analyzeDemo } from 'csdm/node/demo/analyze-demo';

type Parameters = {
  checksum: string;
  demoPath: string;
  source: DemoSource;
  onInsertionStart: () => void;
};

export async function generateMatchPositions({ checksum, demoPath, source, onInsertionStart }: Parameters) {
  const outputFolderPath = getOutputFolderPath();

  const processPositionsInsertion = async () => {
    onInsertionStart();
    const settings = await getSettings();
    const demoName = getDemoNameFromPath(demoPath);
    await deleteMatchPositions(checksum);
    await insertMatchPositions({
      databaseSettings: settings.database,
      outputFolderPath,
      demoName,
    });
  };

  try {
    await analyzeDemo({
      demoPath,
      outputFolderPath,
      source,
      analyzePositions: true,
    });

    await processPositionsInsertion();
  } catch (error) {
    // If the demo is corrupted, we still want to try to insert positions in the database.
    if (error instanceof CorruptedDemoError) {
      await processPositionsInsertion();
    } else {
      throw error;
    }
  } finally {
    deleteCsvFilesInOutputFolder(outputFolderPath);
  }
}
