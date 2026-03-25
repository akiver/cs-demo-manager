import { describe, expect, it } from 'vitest';
import { replaceFilenamePlaceholders } from './replace-filename-placeholders';
import { Game } from 'csdm/common/types/counter-strike';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';

const mockVideo = {
  checksum: 'abc123xyz',
  mapName: 'de_mirage',
  game: Game.CS2,
  encoderSoftware: EncoderSoftware.FFmpeg,
  framerate: 60,
  width: 1920,
  height: 1080,
};

describe('replaceFilenamePlaceholders', () => {
  it('should return "output" when filename is empty', () => {
    const result = replaceFilenamePlaceholders('', mockVideo);
    expect(result).toBe('output');
  });

  it('should return custom filename as-is when no placeholders', () => {
    const result = replaceFilenamePlaceholders('my_video', mockVideo);
    expect(result).toBe('my_video');
  });

  it('should replace {map} placeholder', () => {
    const result = replaceFilenamePlaceholders('{map}', mockVideo);
    expect(result).toBe('de_mirage');
  });

  it('should replace {map} in combination with other text', () => {
    const result = replaceFilenamePlaceholders('{map}_kills', mockVideo);
    expect(result).toBe('de_mirage_kills');
  });

  it('should replace multiple placeholders', () => {
    const result = replaceFilenamePlaceholders('{game}_{map}', mockVideo);
    expect(result).toBe('CS2_de_mirage');
  });

  it('should replace {resolution} and {framerate}', () => {
    const result = replaceFilenamePlaceholders('{resolution}_{framerate}fps', mockVideo);
    expect(result).toBe('1920x1080_60fps');
  });

  it('should replace {encoder}', () => {
    const result = replaceFilenamePlaceholders('{encoder}_output', mockVideo);
    expect(result).toBe('FFmpeg_output');
  });

  it('should replace {checksum}', () => {
    const result = replaceFilenamePlaceholders('{checksum}', mockVideo);
    expect(result).toBe('abc123xyz');
  });

  it('should replace {date} with current date in YYYY-MM-DD format', () => {
    const result = replaceFilenamePlaceholders('{date}', mockVideo);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should replace {time} with current time in HH-MM-SS format', () => {
    const result = replaceFilenamePlaceholders('{time}', mockVideo);
    expect(result).toMatch(/^\d{2}-\d{2}-\d{2}$/);
  });

  it('should replace multiple placeholders including date and time', () => {
    const result = replaceFilenamePlaceholders('{map}_{date}_{time}', mockVideo);
    expect(result).toMatch(/^de_mirage_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
  });

  it('should return "output" when filename contains only whitespace', () => {
    const result = replaceFilenamePlaceholders('   ', mockVideo);
    expect(result).toBe('output');
  });

  it('should sanitize invalid filename characters', () => {
    const result = replaceFilenamePlaceholders('video<bad>chars', mockVideo);
    expect(result).toBe('video_bad_chars');
  });

  it('should handle all placeholders together', () => {
    const result = replaceFilenamePlaceholders(
      '{map}_{game}_{encoder}_{resolution}_{framerate}fps_{checksum}',
      mockVideo,
    );
    expect(result).toBe('de_mirage_CS2_FFmpeg_1920x1080_60fps_abc123xyz');
  });

  it('should sanitize colon character', () => {
    const result = replaceFilenamePlaceholders('clip:{map}', mockVideo);
    expect(result).toBe('clip_de_mirage');
  });
});
