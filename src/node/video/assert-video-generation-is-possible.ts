import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { Sequence } from 'csdm/common/types/sequence';
import { NoSequencesFound } from './errors/no-sequences-found';
import { isWindows } from '../os/is-windows';
import { isHlaeInstalled } from './hlae/is-hlae-installed';
import { HlaeNotInstalled } from './errors/hlae-not-installed';
import { isVirtualDubInstalled } from './virtual-dub/is-virtual-dub-installed';
import { VirtualDubNotInstalled } from './errors/virtual-dub-not-installed';
import { isFfmpegInstalled } from './ffmpeg/is-ffmpeg-installed';
import { FfmpegNotInstalled } from './errors/ffmpeg-not-installed';
import { assertSteamIsRunning } from '../counter-strike/launcher/assert-steam-is-running';

type Parameters = {
  encoderSoftware: EncoderSoftware;
  generateOnlyRawFiles: boolean;
  tickrate: number;
  sequences: Sequence[];
};

export async function assertVideoGenerationIsPossible(parameters: Parameters) {
  const { encoderSoftware, generateOnlyRawFiles } = parameters;

  if (parameters.sequences.length === 0) {
    throw new NoSequencesFound();
  }

  if (isWindows) {
    if (!(await isHlaeInstalled())) {
      throw new HlaeNotInstalled();
    }

    if (!generateOnlyRawFiles && encoderSoftware === EncoderSoftware.VirtualDub && !(await isVirtualDubInstalled())) {
      throw new VirtualDubNotInstalled();
    }
  }

  if (!generateOnlyRawFiles && encoderSoftware === EncoderSoftware.FFmpeg && !(await isFfmpegInstalled())) {
    throw new FfmpegNotInstalled();
  }

  await assertSteamIsRunning();
}
