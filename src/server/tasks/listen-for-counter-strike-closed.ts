import { server } from 'csdm/server/server';
import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';
import { MainServerMessageName } from 'csdm/server/main-server-message-name';
import { getSettings } from 'csdm/node/settings/get-settings';
import { downloadLastValveMatches } from './download-last-valve-matches';
import { downloadLastFaceitMatches } from 'csdm/node/faceit/download-last-faceit-matches';

const checkIntervalMs = 30_000;
let wasRunning = false;
let isProcessingDownload = false;
let startedTimestamp: number = 0;
let intervalId: NodeJS.Timeout | null = null;

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
    }
    startedTimestamp = 0;
  }

  if (isRunning && startedTimestamp === 0) {
    startedTimestamp = Date.now();
  }

  wasRunning = isRunning;
  isProcessingDownload = false;

  if (intervalId !== null) {
    clearInterval(intervalId);
  }

  const checkIntervalMsWhileRunning = 5000;
  const intervalMs = isRunning ? checkIntervalMsWhileRunning : checkIntervalMs;
  intervalId = setInterval(checkIfCounterStrikeHasBeenClosed, intervalMs);
}

export function stopListeningForCounterStrikeClosed() {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
}

export function listenForCounterStrikeClosed() {
  stopListeningForCounterStrikeClosed();

  intervalId = setInterval(checkIfCounterStrikeHasBeenClosed, checkIntervalMs);
}
