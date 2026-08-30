import type { ErrorCode } from 'csdm/common/error-code';
import { CounterStrikeExecutableNotFound } from 'csdm/node/counter-strike/launcher/errors/counter-strike-executable-not-found';
import { CsgoVoiceExtractorUnknownError } from 'csdm/node/csgo-voice-extractor/errors/csgo-voice-extractor-unknown-error';
import { InvalidArgs } from 'csdm/node/csgo-voice-extractor/errors/invalid-args';
import { LoadCsgoLibError } from 'csdm/node/csgo-voice-extractor/errors/load-csgo-lib-error';
import type { ExportVoiceMode } from 'csdm/node/csgo-voice-extractor/export-voice-mode';
import { startCsgoVoiceExtractor } from 'csdm/node/csgo-voice-extractor/start-csgo-voice-extractor';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { server } from 'csdm/server/server';

export type ExportDemoPlayersVoiceProgressPayload = {
  demoNumber: number;
  totalDemoCount: number;
};

export type ExportDemoPlayersVoiceErrorPayload = {
  errorCode: ErrorCode;
  demoPath: string;
};

export type ExportDemoPlayersVoicePayload = {
  demoPaths: string[];
  outputPath: string;
  mode: ExportVoiceMode;
  steamIds: string[];
};

export async function exportDemoPlayersVoiceHandler(payload: ExportDemoPlayersVoicePayload) {
  for (const [demoIndex, demoPath] of payload.demoPaths.entries()) {
    try {
      server.sendPushMessage({
        name: ServerPushMessageName.ExportDemoPlayersVoiceProgress,
        payload: {
          demoNumber: demoIndex + 1,
          totalDemoCount: payload.demoPaths.length,
        },
      });

      await startCsgoVoiceExtractor({
        demoPath,
        outputFolderPath: payload.outputPath,
        mode: payload.mode,
        steamIds: payload.steamIds,
      });
    } catch (error) {
      logger.error(error);
      const errorCode = getErrorCodeFromError(error);
      const payload: ExportDemoPlayersVoiceErrorPayload = {
        demoPath,
        errorCode,
      };
      server.sendPushMessage({
        name: ServerPushMessageName.ExportDemoPlayersVoiceError,
        payload,
      });

      const errorsThatShouldStopTheExport = [
        CounterStrikeExecutableNotFound,
        LoadCsgoLibError,
        InvalidArgs,
        CsgoVoiceExtractorUnknownError,
      ];
      const shouldStopExport = errorsThatShouldStopTheExport.some((err) => error instanceof err);
      if (shouldStopExport) {
        server.sendPushMessage({
          name: ServerPushMessageName.ExportDemoPlayersVoiceDone,
        });
        break;
      }
    } finally {
      if (demoIndex === payload.demoPaths.length - 1) {
        server.sendPushMessage({
          name: ServerPushMessageName.ExportDemoPlayersVoiceDone,
        });
      }
    }
  }
}
