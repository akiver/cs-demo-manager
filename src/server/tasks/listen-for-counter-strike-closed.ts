import { server } from 'csdm/server/server';
import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';
import { MainServerMessageName } from 'csdm/server/main-server-message-name';
import { getSettings } from 'csdm/node/settings/get-settings';
import { downloadLastValveMatches } from './download-last-valve-matches';
import { downloadLastFaceitMatches } from 'csdm/node/faceit/download-last-faceit-matches';
import { downloadLast5EPlayMatches } from 'csdm/node/5eplay/download-last-5eplay-matches';
import { downloadLastRenownMatches } from 'csdm/node/renown/download-last-renown-matches';

const checkIntervalMs = 30_000;
let wasRunning = false;
let isProcessingDownload = false;
let startedTimestamp: number = 0;
let intervalId: NodeJS.Timeout | null = null;
let isListening = false;
let pendingCheck: Promise<void> | undefined;

async function checkIfCounterStrikeHasBeenClosed() {
  // Make sure we don't try to start downloading new demos while we are already downloading demos
  if (isProcessingDownload) {
    return;
  }

  const isRunning = await isCounterStrikeRunning();
  const hasBeenClosed = !isRunning && wasRunning;
  if (hasBeenClosed) {
    const minimalRunningTimeMs = 1_200_000; // 20 minutes
    const hasBeenRunningLongEnough = Date.now() - startedTimestamp > minimalRunningTimeMs;
    if (hasBeenRunningLongEnough) {
      isProcessingDownload = true;
      const settings = await getSettings();

      if (settings.download.downloadValveDemosInBackground) {
        const downloadsAdded = await downloadLastValveMatches();
        if (downloadsAdded.length > 0) {
          server.sendMessageToMainProcess({
            name: MainServerMessageName.DownloadValveDemoStarted,
            payload: downloadsAdded.length,
          });
        }
      }

      if (settings.download.downloadFaceitDemosInBackground) {
        const downloadsAdded = await downloadLastFaceitMatches();
        if (downloadsAdded.length > 0) {
          server.sendMessageToMainProcess({
            name: MainServerMessageName.DownloadFaceitDemoStarted,
            payload: downloadsAdded.length,
          });
        }
      }

      if (settings.download.download5EPlayDemosInBackground) {
        const downloadsAdded = await downloadLast5EPlayMatches();
        if (downloadsAdded.length > 0) {
          server.sendMessageToMainProcess({
            name: MainServerMessageName.Download5EPlayDemoStarted,
            payload: downloadsAdded.length,
          });
        }
      }

      if (settings.download.downloadRenownDemosInBackground) {
        const downloadsAdded = await downloadLastRenownMatches();
        if (downloadsAdded.length > 0) {
          server.sendMessageToMainProcess({
            name: MainServerMessageName.DownloadRenownDemosStarted,
            payload: downloadsAdded.length,
          });
        }
      }
    }
    startedTimestamp = 0;
  }

  if (isRunning && startedTimestamp === 0) {
    startedTimestamp = Date.now();
  }

  wasRunning = isRunning;
  isProcessingDownload = false;

  return isRunning;
}

function scheduleNextCheck(delayMs: number) {
  if (!isListening) {
    return;
  }

  intervalId = setTimeout(() => {
    const check = checkIfCounterStrikeHasBeenClosed()
      .then((isRunning) => {
        const checkIntervalMsWhileRunning = 5000;
        scheduleNextCheck(isRunning ? checkIntervalMsWhileRunning : checkIntervalMs);
      })
      .catch((error) => {
        isProcessingDownload = false;
        logger.error('Error while checking if Counter-Strike has been closed');
        logger.error(error);
        scheduleNextCheck(checkIntervalMs);
      })
      .finally(() => {
        if (pendingCheck === check) {
          pendingCheck = undefined;
        }
      });
    pendingCheck = check;
  }, delayMs);
}

export async function stopListeningForCounterStrikeClosed() {
  isListening = false;
  if (intervalId !== null) {
    clearTimeout(intervalId);
    intervalId = null;
  }

  if (pendingCheck !== undefined) {
    await pendingCheck;
  }
}

export function listenForCounterStrikeClosed() {
  isListening = true;
  if (intervalId !== null) {
    clearTimeout(intervalId);
  }
  scheduleNextCheck(checkIntervalMs);
}
