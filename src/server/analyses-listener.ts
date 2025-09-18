import path from 'node:path';
import os from 'node:os';
import { server } from './server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import type { Demo } from 'csdm/common/types/demo';
import type { Analysis } from 'csdm/common/types/analysis';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import { processMatchInsertion } from 'csdm/node/database/matches/process-match-insertion';
import { CorruptedDemoError } from 'csdm/node/demo-analyzer/corrupted-demo-error';
import { analyzeDemo } from 'csdm/node/demo/analyze-demo';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getErrorCodeFromError } from './get-error-code-from-error';
import type { ErrorCode } from 'csdm/common/error-code';
import { MAX_CONCURRENT_ANALYSES } from 'csdm/common/analyses';

class AnalysesListener {
  private analyses: Analysis[] = [];
  private currentAnalyses: Analysis[] = [];
  private outputFolderPath: string; // Folder path where CSV files will be write on the host

  public constructor() {
    this.outputFolderPath = path.resolve(os.tmpdir(), 'cs-demo-manager');
  }

  public removeDemosByChecksums(checksums: string[]) {
    this.analyses = this.analyses.filter((analysis) => {
      return !checksums.includes(analysis.demoChecksum);
    });
    logger.log(`${checksums} removed from analyses`);
  }

  public async addDemosToAnalyses(demos: Demo[]) {
    const demosNotInPendingAnalyses = demos.filter((demo) => {
      return !this.analyses.some((analysis) => analysis.demoChecksum === demo.checksum);
    });
    if (demosNotInPendingAnalyses.length === 0) {
      return;
    }

    const analyses = demosNotInPendingAnalyses.map((demo) => {
      const analysis: Analysis = {
        addedAt: new Date().toISOString(),
        status: AnalysisStatus.Pending,
        demoChecksum: demo.checksum,
        demoPath: demo.filePath,
        mapName: demo.mapName,
        source: demo.source,
        output: '',
      };

      return analysis;
    });
    this.analyses.push(...analyses);

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.DemosAddedToAnalyses,
      payload: analyses,
    });

    await this.loopUntilAnalysesDone();
  }

  public getAnalyses = () => {
    return [...this.analyses, ...this.currentAnalyses];
  };

  public hasAnalysesInProgress = () => {
    return this.hasPendingAnalyses() || this.currentAnalyses.length > 0;
  };

  public clear() {
    this.analyses = [];
    this.currentAnalyses = [];
  }

  private hasPendingAnalyses = () => {
    return this.analyses.length > 0;
  };

  private async loopUntilAnalysesDone() {
    const promises: Promise<void>[] = [];

    const settings = await getSettings();
    const maxConcurrentAnalyses = Math.min(
      MAX_CONCURRENT_ANALYSES,
      settings.analyze.maxConcurrentAnalyses ?? MAX_CONCURRENT_ANALYSES / 2,
    );
    while (this.analyses.length > 0 && this.currentAnalyses.length < maxConcurrentAnalyses) {
      const analysis = this.analyses.shift();
      if (analysis) {
        this.currentAnalyses.push(analysis);
        const analysisPromise = this.processAnalysis(analysis, settings.analyze.analyzePositions)
          .catch((error) => {
            logger.error('Unhandled error during analysis');
            logger.error(error);
          })
          .finally(() => {
            this.currentAnalyses = this.currentAnalyses.filter(
              ({ demoChecksum }) => demoChecksum !== analysis.demoChecksum,
            );
          });

        promises.push(analysisPromise);
      }
    }

    if (promises.length > 0) {
      await Promise.race(promises);
      if (this.analyses.length > 0) {
        await this.loopUntilAnalysesDone();
      }
    }
  }

  private readonly processAnalysis = async (analysis: Analysis, analyzePositions: boolean) => {
    const { demoChecksum: checksum, demoPath, source } = analysis;
    try {
      this.updateAnalysisStatus(analysis, AnalysisStatus.Analyzing);
      await analyzeDemo({
        demoPath,
        outputFolderPath: this.getAnalysisOutputFolderPath(analysis),
        source,
        analyzePositions,
        onStdout: (data) => {
          logger.log(data);
          analysis.output += data;
          server.sendMessageToRendererProcess({
            name: RendererServerMessageName.AnalysisUpdated,
            payload: analysis,
          });
        },
        onStderr(data) {
          logger.error(data);
          analysis.output += data;
          server.sendMessageToRendererProcess({
            name: RendererServerMessageName.AnalysisUpdated,
            payload: analysis,
          });
        },
      });
      this.updateAnalysisStatus(analysis, AnalysisStatus.AnalyzeSuccess);

      await this.insertMatch(analysis, checksum, demoPath);
    } catch (error) {
      logger.error('Error while analyzing demo');
      if (error) {
        logger.error(error);
      }
      const isCorruptedDemo = error instanceof CorruptedDemoError;
      if (!isCorruptedDemo && error instanceof Error) {
        analysis.output += error.message;
      }
      this.updateAnalysisStatus(analysis, AnalysisStatus.AnalyzeError);
      // If the demo is corrupted, we still want to try to insert it in the database.
      if (isCorruptedDemo) {
        await this.insertMatch(analysis, checksum, demoPath);
      }
    }
  };

  private async insertMatch(analysis: Analysis, checksum: string, demoPath: string) {
    try {
      this.updateAnalysisStatus(analysis, AnalysisStatus.Inserting);
      const match = await processMatchInsertion({
        checksum,
        demoPath,
        outputFolderPath: this.getAnalysisOutputFolderPath(analysis),
      });
      this.updateAnalysisStatus(analysis, AnalysisStatus.InsertSuccess);
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.MatchInserted,
        payload: match,
      });
    } catch (error) {
      logger.error('Error while inserting match');
      logger.error(error);
      let errorOutput: string;
      if (error instanceof Error) {
        errorOutput = error.message;
        if (error.stack) {
          errorOutput += `\n${error.stack}`;
        }
        if (error.cause) {
          errorOutput += `\n${error.cause}`;
        }
      } else {
        errorOutput = String(error);
      }
      analysis.output += errorOutput;

      this.updateAnalysisStatus(analysis, AnalysisStatus.InsertError, getErrorCodeFromError(error));
    }
  }

  private updateAnalysisStatus = (analysis: Analysis, status: AnalysisStatus, errorCode?: ErrorCode) => {
    analysis.status = status;
    analysis.errorCode = errorCode;
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.AnalysisUpdated,
      payload: analysis,
    });
  };

  private getAnalysisOutputFolderPath(analysis: Analysis) {
    return path.join(this.outputFolderPath, analysis.demoChecksum);
  }
}

export const analysesListener = new AnalysesListener();
