import type { Demo } from 'csdm/common/types/demo';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { AnalysesListener } from './analyses-listener';

const { analyzeDemoMock, processMatchInsertionMock } = vi.hoisted(() => {
  return {
    analyzeDemoMock: vi.fn(),
    processMatchInsertionMock: vi.fn(),
  };
});

vi.mock('./server', () => {
  return { server: { sendMessageToRendererProcess: vi.fn() } };
});
vi.mock('csdm/node/demo/analyze-demo', () => {
  return { analyzeDemo: analyzeDemoMock };
});
vi.mock('csdm/node/database/matches/process-match-insertion', () => {
  return { processMatchInsertion: processMatchInsertionMock };
});
vi.mock('csdm/node/settings/get-settings', () => {
  return {
    getSettings: () => {
      return Promise.resolve({ analyze: { maxConcurrentAnalyses: 1, analyzePositions: false } });
    },
  };
});

const demo = {
  checksum: 'checksum',
  filePath: 'demo.dem',
  mapName: 'de_dust2',
  source: 'manual',
} as unknown as Demo;

beforeEach(() => {
  analyzeDemoMock.mockReset();
  processMatchInsertionMock.mockReset();
  processMatchInsertionMock.mockResolvedValue({});
});

describe('AnalysesListener database transitions', () => {
  it('should refuse a transition until a running analysis and its insertion finish', async () => {
    let finishAnalysis: (() => void) | undefined;
    analyzeDemoMock.mockImplementationOnce(() => {
      return new Promise<void>((resolve) => {
        finishAnalysis = resolve;
      });
    });

    const listener = new AnalysesListener();
    const pendingAnalysis = listener.addDemosToAnalyses([demo]);
    await vi.waitFor(() => {
      expect(listener.hasAnalysesInProgress()).toBe(true);
    });
    expect(listener.tryBeginDatabaseTransition()).toBeUndefined();

    finishAnalysis?.();
    await pendingAnalysis;

    const releaseTransition = listener.tryBeginDatabaseTransition();
    expect(releaseTransition).toBeTypeOf('function');
    releaseTransition?.();
  });

  it('should reject new analyses while a database transition is active', async () => {
    const listener = new AnalysesListener();
    const releaseTransition = listener.tryBeginDatabaseTransition();

    await expect(listener.addDemosToAnalyses([demo])).rejects.toThrow('cannot be changed');
    releaseTransition?.();
  });
});
