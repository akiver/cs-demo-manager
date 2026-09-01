import path from 'node:path';
import os from 'node:os';
import { server } from './server';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
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
  // Tracks which client connection queued a demo so its pending analyses can be canceled when it disconnects.
  private clientIdPerChecksum = new Map<string, string>();
  private outputFolderPath: string; // Folder path where CSV files will be write on the host

  public constructor() {
    this.outputFolderPath = path.resolve(os.tmpdir(), 'cs-demo-manager');
  }

  public removeDemosByChecksums(checksums: string[]) {
    this.analyses = this.analyses.filter((analysis) => {
      return !checksums.includes(analysis.demoChecksum);
    });
    for (const checksum of checksums) {
      this.clientIdPerChecksum.delete(checksum);
    }
    logger.log(`checksums removed from analyses`, checksums);
  }

  public removeDemosAddedByClient(clientId: string) {
    const checksums: string[] = [];
    for (const [checksum, id] of this.clientIdPerChecksum) {
      if (id === clientId) {
        checksums.push(checksum);
      }
    }

    if (checksums.length > 0) {
      logger.log(`Removing ${checksums.length} pending analysis(es) added by the client ${clientId}`);
      this.removeDemosByChecksums(checksums);
      server.sendPushMessage({
        name: ServerPushMessageName.DemosRemovedFromAnalyses,
        payload: checksums,
      });
    }
  }

  public async addDemosToAnalyses(demos: Demo[], options?: { analyzePositions?: boolean; clientId?: string }) {
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
        analyzePositions: options?.analyzePositions,
      };

      return analysis;
    });
    this.analyses.push(...analyses);
    if (typeof options?.clientId === 'string') {
      for (const analysis of analyses) {
        this.clientIdPerChecksum.set(analysis.demoChecksum, options.clientId);
      }
    }

    server.sendPushMessage({
      name: ServerPushMessageName.DemosAddedToAnalyses,
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
    this.clientIdPerChecksum.clear();
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
        // The analysis is starting: it cannot be interrupted anymore, stop tracking its owner.
        this.clientIdPerChecksum.delete(analysis.demoChecksum);
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
        analyzePositions: analysis.analyzePositions ?? analyzePositions,
        onStdout: (data) => {
          logger.log(data);
          analysis.output += data;
          server.sendPushMessage({
            name: ServerPushMessageName.AnalysisUpdated,
            payload: analysis,
          });
        },
        onStderr(data) {
          logger.error(data);
          analysis.output += data;
          server.sendPushMessage({
            name: ServerPushMessageName.AnalysisUpdated,
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
      server.sendPushMessage({
        name: ServerPushMessageName.MatchInserted,
        payload: match,
      });
    } catch (error) {
      let errorOutput: string;
      if (error instanceof Error) {
        errorOutput = error.stack ?? error.message;
        if (error.cause) {
          errorOutput += `\n${error.cause as string}`;
        }
        const jsonError = JSON.stringify(error);
        if (jsonError !== '{}') {
          errorOutput += `\n${jsonError}`;
        }
      } else {
        errorOutput = String(error);
      }
      logger.error('Error while inserting match');
      logger.error(errorOutput);
      analysis.output += errorOutput;

      this.updateAnalysisStatus(analysis, AnalysisStatus.InsertError, getErrorCodeFromError(error));
    }
  }

  private updateAnalysisStatus = (analysis: Analysis, status: AnalysisStatus, errorCode?: ErrorCode) => {
    analysis.status = status;
    analysis.errorCode = errorCode;
    server.sendPushMessage({
      name: ServerPushMessageName.AnalysisUpdated,
      payload: analysis,
    });
  };

  private getAnalysisOutputFolderPath(analysis: Analysis) {
    return path.join(this.outputFolderPath, analysis.demoChecksum);
  }
}

export const analysesListener = new AnalysesListener();
