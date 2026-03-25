import { format } from 'date-fns';
import type { Game } from 'csdm/common/types/counter-strike';
import type { EncoderSoftware } from 'csdm/common/types/encoder-software';

type FilenamePlaceholderValues = {
  mapName: string;
  checksum: string;
  game: Game;
  encoderSoftware: EncoderSoftware;
  width: number;
  height: number;
  framerate: number;
};

export function replaceFilenamePlaceholders(fileName: string, values: FilenamePlaceholderValues): string {
  if (!fileName) {
    return 'output';
  }

  const now = new Date();

  let result = fileName
    .replace(/\{map\}/g, values.mapName)
    .replace(/\{checksum\}/g, values.checksum)
    .replace(/\{game\}/g, values.game)
    .replace(/\{date\}/g, format(now, 'yyyy-MM-dd'))
    .replace(/\{time\}/g, format(now, 'HH-mm-ss'))
    .replace(/\{encoder\}/g, values.encoderSoftware)
    .replace(/\{resolution\}/g, `${values.width}x${values.height}`)
    .replace(/\{framerate\}/g, values.framerate.toString());

  result = result.replace(/[<>:"\\/|?*]/g, '_');
  result = result.trim();
  return result.length > 0 ? result : 'output';
}
