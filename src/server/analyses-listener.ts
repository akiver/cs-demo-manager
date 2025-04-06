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

class AnalysesListener {
  private analyses: Analysis[] = [];
  private currentAnalysis: Analysis | undefined;
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
    if (this.currentAnalysis !== undefined) {
      return [...this.analyses, this.currentAnalysis];
    }
    return this.analyses;
  };

  public hasAnalysesInProgress = () => {
    return this.hasPendingAnalyses() || this.currentAnalysis !== undefined;
  };

  public clear() {
    this.analyses = [];
    this.currentAnalysis = undefined;
  }

  private hasPendingAnalyses = () => {
    return this.analyses.length > 0;
  };

  private async loopUntilAnalysesDone() {
    if (this.currentAnalysis) {
      return;
    }

    this.currentAnalysis = this.analyses.shift();
    while (this.currentAnalysis) {
      await this.processAnalysis(this.currentAnalysis);
      this.currentAnalysis = this.analyses.shift();
    }
  }

  private readonly processAnalysis = async (analysis: Analysis) => {
    const { demoChecksum: checksum, demoPath, source } = analysis;
    try {
      this.updateCurrentAnalysisStatus(AnalysisStatus.Analyzing);
      const settings = await getSettings();
      await analyzeDemo({
        demoPath,
        outputFolderPath: this.outputFolderPath,
        source,
        analyzePositions: settings.analyze.analyzePositions,
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
      this.updateCurrentAnalysisStatus(AnalysisStatus.AnalyzeSuccess);

      await this.insertMatch(checksum, demoPath);
    } catch (error) {
      logger.error('Error while analyzing demo');
      if (error) {
        logger.error(error);
      }
      const isCorruptedDemo = error instanceof CorruptedDemoError;
      if (!isCorruptedDemo && this.currentAnalysis && error instanceof Error) {
        this.currentAnalysis.output += error.message;
      }
      this.updateCurrentAnalysisStatus(AnalysisStatus.AnalyzeError);
      // If the demo is corrupted, we still want to try to insert it in the database.
      if (isCorruptedDemo) {
        await this.insertMatch(checksum, demoPath);
      }
    }
  };

  private async insertMatch(checksum: string, demoPath: string) {
    try {
      this.updateCurrentAnalysisStatus(AnalysisStatus.Inserting);
      const match = await processMatchInsertion({
        checksum,
        demoPath,
        outputFolderPath: this.outputFolderPath,
      });
      this.updateCurrentAnalysisStatus(AnalysisStatus.InsertSuccess);
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.MatchInserted,
        payload: match,
      });
    } catch (error) {
      logger.error('Error while inserting match');
      logger.error(error);
      if (this.currentAnalysis) {
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
        this.currentAnalysis.output += errorOutput;
      }

      this.updateCurrentAnalysisStatus(AnalysisStatus.InsertError, getErrorCodeFromError(error));
    }
  }

  private updateCurrentAnalysisStatus = (status: AnalysisStatus, errorCode?: ErrorCode) => {
    if (this.currentAnalysis !== undefined) {
      this.currentAnalysis.status = status;
      this.currentAnalysis.errorCode = errorCode;
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.AnalysisUpdated,
        payload: this.currentAnalysis,
      });
    }
  };
}

export const analysesListener = new AnalysesListener();
