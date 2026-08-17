import { ErrorCode } from 'csdm/common/error-code';
import { DatabaseTransitionInProgress } from 'csdm/node/database/errors/database-transition-in-progress';
import { describe, expect, it, vi } from 'vite-plus/test';
import { addDemosToAnalysesHandler } from './add-demos-to-analyses-handler';

const mocks = vi.hoisted(() => {
  return { addDemosToAnalyses: vi.fn() };
});

vi.mock('csdm/server/analyses-listener', () => {
  return { analysesListener: { addDemosToAnalyses: mocks.addDemosToAnalyses } };
});

describe('addDemosToAnalysesHandler', () => {
  it('returns a structured error when a database transition blocks the analysis', async () => {
    mocks.addDemosToAnalyses.mockRejectedValue(new DatabaseTransitionInProgress());

    await expect(addDemosToAnalysesHandler([])).resolves.toEqual({
      code: ErrorCode.DatabaseTransitionInProgress,
      message: 'The database cannot be changed while demo analyses are in progress.',
    });
  });
});
