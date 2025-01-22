import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { Sequence } from 'csdm/common/types/sequence';
import { NoSequencesFound } from '../errors/no-sequences-found';
import { isHlaeInstalled } from '../hlae/is-hlae-installed';
import { HlaeNotInstalled } from '../errors/hlae-not-installed';
import { isVirtualDubInstalled } from '../virtual-dub/is-virtual-dub-installed';
import { VirtualDubNotInstalled } from '../errors/virtual-dub-not-installed';
import { isFfmpegInstalled } from '../ffmpeg/is-ffmpeg-installed';
import { FfmpegNotInstalled } from '../errors/ffmpeg-not-installed';
import { assertSteamIsRunning } from '../../counter-strike/launcher/assert-steam-is-running';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { RecordingOutput } from 'csdm/common/types/recording-output';

type Parameters = {
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  encoderSoftware: EncoderSoftware;
  tickrate: number;
  sequences: Sequence[];
};

export async function assertVideoGenerationIsPossible(parameters: Parameters) {
  const { recordingSystem, recordingOutput, encoderSoftware } = parameters;

  if (parameters.sequences.length === 0) {
    throw new NoSequencesFound();
  }

  const shouldGenerateVideo = recordingOutput !== RecordingOutput.Images;

  if (recordingSystem === RecordingSystem.HLAE) {
    if (!(await isHlaeInstalled())) {
      throw new HlaeNotInstalled();
    }

    if (shouldGenerateVideo && encoderSoftware === EncoderSoftware.VirtualDub && !(await isVirtualDubInstalled())) {
      throw new VirtualDubNotInstalled();
    }
  }

  if (shouldGenerateVideo && encoderSoftware === EncoderSoftware.FFmpeg && !(await isFfmpegInstalled())) {
    throw new FfmpegNotInstalled();
  }

  await assertSteamIsRunning();
}
