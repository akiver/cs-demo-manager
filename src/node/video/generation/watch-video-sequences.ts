import { Game } from 'csdm/common/types/counter-strike';
import type { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import type { Sequence } from 'csdm/common/types/sequence';
import { sortSequencesByStartTick } from 'csdm/common/video/sort-sequences-by-start-tick';
import type { FfmpegSettings } from 'csdm/node/settings/settings';
import { assertVideoGenerationIsPossible } from './assert-video-generation-is-possible';
import { createCsgoVideoJsonFile } from './create-csgo-video-json-file';
import { fetchMatchPlayersSlots } from 'csdm/node/database/match/fetch-match-players-slots';
import { createCs2VideoJsonFile } from './create-cs2-video-json-file';
import { watchDemoWithHlae } from 'csdm/node/counter-strike/launcher/watch-demo-with-hlae';
import { startCounterStrike } from 'csdm/node/counter-strike/launcher/start-counter-strike';
import { fetchCameras } from 'csdm/node/database/cameras/fetch-cameras';

type Parameters = {
  checksum: string;
  game: Game;
  tickrate: number;
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  encoderSoftware: EncoderSoftware;
  framerate: number;
  width: number;
  height: number;
  closeGameAfterRecording: boolean;
  ffmpegSettings: FfmpegSettings;
  outputFolderPath: string;
  demoPath: string;
  sequences: Sequence[];
};

export async function watchVideoSequences(parameters: Parameters) {
  const sequences = sortSequencesByStartTick(parameters.sequences);
  await assertVideoGenerationIsPossible(parameters);

  const { checksum, recordingSystem, demoPath, width, height, game } = parameters;
  const cameras = await fetchCameras(game);
  if (game === Game.CSGO) {
    await createCsgoVideoJsonFile({
      type: 'watch',
      ...parameters,
      sequences,
    });
  } else {
    const players = await fetchMatchPlayersSlots(checksum);
    await createCs2VideoJsonFile({
      type: 'watch',
      ...parameters,
      sequences,
      players,
      cameras,
    });
  }

  if (recordingSystem === RecordingSystem.HLAE) {
    await watchDemoWithHlae({
      demoPath,
      game,
      width,
      height,
      fullscreen: false,
    });
  } else {
    await startCounterStrike({
      game,
      demoPath,
      width,
      height,
      fullscreen: false,
    });
  }
}
