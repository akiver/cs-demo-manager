import fs from 'fs-extra';
import { GameClientMessageName } from 'csdm/server/game-client-message-name';
import { GameServerMessageName } from 'csdm/server/game-server-message-name';
import { sendMessageToGame } from 'csdm/server/counter-strike';
import { assertCounterStrikeIsRunning } from '../assert-counter-strike-is-running';
import { getRecordingFolderPath } from '../get-recording-folder-path';
import { Game } from 'csdm/common/types/counter-strike';
import { glob } from 'csdm/node/filesystem/glob';
import { RawFilesNotFoundError } from 'csdm/node/video/errors/raw-files-not-found';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

type CapturePlayerViewCS2 = {
  game: typeof Game.CS2;
  screenshotPath: string;
};

type CapturePlayerViewCSGO = {
  game: typeof Game.CSGO;
  screenshotPath: string;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
};

export type CapturePlayerViewPayload = CapturePlayerViewCS2 | CapturePlayerViewCSGO;

function assertScreenshotFilesNotEmpty(paths: string[]) {
  if (paths.length === 0) {
    throw new RawFilesNotFoundError();
  }
}
async function assertRecordingFolderExists(folderPath: string) {
  const exists = await fs.pathExists(folderPath);
  if (!exists) {
    throw new RawFilesNotFoundError();
  }
}

async function deleteScreenshotFiles(game: Game, recordingFolderPath: string) {
  if (game === Game.CSGO) {
    const images = await glob(`**/csdmcamera*.jpg`, {
      cwd: recordingFolderPath,
      followSymbolicLinks: false,
      absolute: true,
      onlyFiles: true,
    });
    await Promise.all(images.map((imagePath) => fs.remove(imagePath)));
  } else {
    await fs.remove(recordingFolderPath);
  }
}

// Retrieves the local player's current coordinates and captures a screenshot of the in‑game view.
// It requires the game to have been launched from CS:DM.
//
// Coordinate retrieval differs between CS2 and CS:GO:
// - CS2:
//   * The CS2 plugin executes the "getposcopy" command.
//   * The UI then reads the coordinates from the clipboard.
// - CS:GO:
//   * The CS:GO plugin uses game interfaces to retrieve the coordinates.
//   * The coordinates are sent back to the app.
//
// In both games, the screenshot is produced by running the "startmovie"/"endmovie" commands from the plugin,
// and the app then selects the last screenshot file generated in the recording folder.
// For CS:GO this could also be done via the "screenshot" command or an internal interface call, but to keep the
// behavior consistent between both games and maintain a single code path, we use the same method.
export async function capturePlayerView(game: Game): Promise<CapturePlayerViewPayload> {
  await assertCounterStrikeIsRunning();
  const recordingFolderPath = await getRecordingFolderPath(game);
  await deleteScreenshotFiles(game, recordingFolderPath);

  return new Promise<CapturePlayerViewPayload>((resolve, reject) => {
    sendMessageToGame({
      message: {
        name: GameServerMessageName.CapturePlayerView,
        payload: null,
      },
      responseMessageName: GameClientMessageName.CapturePlayerViewResult,
      onResponse: async (coordinates) => {
        try {
          await assertRecordingFolderExists(recordingFolderPath);
          const screenshotImages = await glob('**/csdmcamera*.jpg', {
            cwd: recordingFolderPath,
            followSymbolicLinks: false,
            absolute: true,
            onlyFiles: true,
          });
          assertScreenshotFilesNotEmpty(screenshotImages);
          const screenshotPath = lastArrayItem(screenshotImages);
          if (game === Game.CSGO) {
            if (!coordinates) {
              return reject(new Error('No coordinates received from the game'));
            }
            return resolve({
              game: Game.CSGO,
              screenshotPath,
              ...coordinates,
            });
          }
          return resolve({
            game: Game.CS2,
            screenshotPath,
          });
        } catch (error) {
          reject(error);
        }
      },
    }).catch(reject);
  });
}
