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
let listenerGeneration = 0;
const pendingChecks = new Set<Promise<void>>();

async function checkIfCounterStrikeHasBeenClosed(signal?: AbortSignal) {
  signal?.throwIfAborted();
  // Make sure we don't try to start downloading new demos while we are already downloading demos
  if (isProcessingDownload) {
    return;
  }

  const isRunning = await isCounterStrikeRunning();
  signal?.throwIfAborted();
  const hasBeenClosed = !isRunning && wasRunning;
  if (hasBeenClosed) {
    const minimalRunningTimeMs = 1_200_000; // 20 minutes
    const hasBeenRunningLongEnough = Date.now() - startedTimestamp > minimalRunningTimeMs;
    if (hasBeenRunningLongEnough) {
      isProcessingDownload = true;
      const settings = await getSettings();
      signal?.throwIfAborted();

      if (settings.download.downloadValveDemosInBackground) {
        const downloadsAdded = await downloadLastValveMatches(signal);
        if (downloadsAdded.length > 0) {
          server.sendMessageToMainProcess({
            name: MainServerMessageName.DownloadValveDemoStarted,
            payload: downloadsAdded.length,
          });
        }
      }

      if (settings.download.downloadFaceitDemosInBackground) {
        const downloadsAdded = await downloadLastFaceitMatches(signal);
        if (downloadsAdded.length > 0) {
          server.sendMessageToMainProcess({
            name: MainServerMessageName.DownloadFaceitDemoStarted,
            payload: downloadsAdded.length,
          });
        }
      }

      if (settings.download.download5EPlayDemosInBackground) {
        const downloadsAdded = await downloadLast5EPlayMatches(signal);
        if (downloadsAdded.length > 0) {
          server.sendMessageToMainProcess({
            name: MainServerMessageName.Download5EPlayDemoStarted,
            payload: downloadsAdded.length,
          });
        }
      }

      if (settings.download.downloadRenownDemosInBackground) {
        const downloadsAdded = await downloadLastRenownMatches(signal);
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

function scheduleNextCheck(delayMs: number, generation: number, signal?: AbortSignal) {
  if (!isListening || generation !== listenerGeneration || signal?.aborted) {
    return;
  }

  const timeout = setTimeout(() => {
    if (intervalId === timeout) {
      intervalId = null;
    }
    if (!isListening || generation !== listenerGeneration || signal?.aborted) {
      return;
    }

    const check = checkIfCounterStrikeHasBeenClosed(signal)
      .then((isRunning) => {
        const checkIntervalMsWhileRunning = 5000;
        scheduleNextCheck(isRunning ? checkIntervalMsWhileRunning : checkIntervalMs, generation, signal);
      })
      .catch((error) => {
        isProcessingDownload = false;
        if (signal?.aborted || generation !== listenerGeneration) {
          return;
        }
        logger.error('Error while checking if Counter-Strike has been closed');
        logger.error(error);
        scheduleNextCheck(checkIntervalMs, generation, signal);
      })
      .finally(() => {
        pendingChecks.delete(check);
      });
    pendingChecks.add(check);
  }, delayMs);
  intervalId = timeout;
}

export async function stopListeningForCounterStrikeClosed() {
  isListening = false;
  listenerGeneration++;
  if (intervalId !== null) {
    clearTimeout(intervalId);
    intervalId = null;
  }

  await Promise.allSettled(pendingChecks);
}

export function listenForCounterStrikeClosed(signal?: AbortSignal) {
  isListening = true;
  const generation = ++listenerGeneration;
  if (intervalId !== null) {
    clearTimeout(intervalId);
  }
  scheduleNextCheck(checkIntervalMs, generation, signal);
}
