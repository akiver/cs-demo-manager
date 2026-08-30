import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import type { Demo } from 'csdm/common/types/demo';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { analysesListener } from 'csdm/server/analyses-listener';
import { addDemoPathsToAnalysesHandler } from './add-demo-paths-to-analyses-handler';

vi.mock('csdm/node/demo/get-demo-from-file-path', () => {
  return {
    getDemoFromFilePath: vi.fn(),
  };
});
vi.mock('csdm/node/database/matches/fetch-match-checksums', () => {
  return {
    fetchMatchChecksums: vi.fn(),
  };
});
vi.mock('csdm/server/analyses-listener', () => {
  return {
    analysesListener: {
      addDemosToAnalyses: vi.fn(() => Promise.resolve()),
    },
  };
});
vi.mock('csdm/server/ensure-database-connection', () => {
  return {
    ensureDatabaseConnection: vi.fn(() => Promise.resolve()),
  };
});

vi.stubGlobal('logger', {
  debug: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

function buildDemo(checksum: string, filePath: string) {
  return {
    checksum,
    filePath,
    mapName: 'de_dust2',
    source: 'valve',
  } as unknown as Demo;
}

describe('addDemoPathsToAnalysesHandler', () => {
  beforeEach(() => {
    vi.mocked(getDemoFromFilePath).mockReset();
    vi.mocked(fetchMatchChecksums).mockReset();
    vi.mocked(analysesListener.addDemosToAnalyses).mockClear();
  });

  it('should skip demos already in the database', async () => {
    vi.mocked(fetchMatchChecksums).mockResolvedValue(['checksum-1']);
    vi.mocked(getDemoFromFilePath).mockImplementation((filePath: string) => {
      return Promise.resolve(buildDemo(filePath === '/demos/demo1.dem' ? 'checksum-1' : 'checksum-2', filePath));
    });

    const result = await addDemoPathsToAnalysesHandler({
      demoPaths: ['/demos/demo1.dem', '/demos/demo2.dem'],
      force: false,
      analyzePositions: false,
    });

    expect(result.skippedDemoPaths).toEqual(['/demos/demo1.dem']);
    expect(result.addedDemos).toEqual([{ checksum: 'checksum-2', demoPath: '/demos/demo2.dem' }]);
    expect(analysesListener.addDemosToAnalyses).toHaveBeenCalledWith(
      [expect.objectContaining({ checksum: 'checksum-2' })],
      {
        analyzePositions: false,
      },
    );
  });

  it('should not skip demos already in the database when force is enabled', async () => {
    vi.mocked(fetchMatchChecksums).mockResolvedValue(['checksum-1']);
    vi.mocked(getDemoFromFilePath).mockResolvedValue(buildDemo('checksum-1', '/demos/demo1.dem'));

    const result = await addDemoPathsToAnalysesHandler({
      demoPaths: ['/demos/demo1.dem'],
      force: true,
      analyzePositions: true,
    });

    expect(result.skippedDemoPaths).toEqual([]);
    expect(result.addedDemos).toEqual([{ checksum: 'checksum-1', demoPath: '/demos/demo1.dem' }]);
  });

  it('should override the demo source when provided', async () => {
    vi.mocked(fetchMatchChecksums).mockResolvedValue([]);
    vi.mocked(getDemoFromFilePath).mockResolvedValue(buildDemo('checksum-1', '/demos/demo1.dem'));

    await addDemoPathsToAnalysesHandler({
      demoPaths: ['/demos/demo1.dem'],
      force: false,
      analyzePositions: false,
      source: 'esl' as Demo['source'],
    });

    expect(analysesListener.addDemosToAnalyses).toHaveBeenCalledWith([expect.objectContaining({ source: 'esl' })], {
      analyzePositions: false,
    });
  });
});
