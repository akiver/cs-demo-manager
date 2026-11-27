import fs from 'fs-extra';
import path from 'node:path';
import { runProcess } from './run-process';
import type { HudFrames } from './render-hud-frames';

export type VideoInfo = { duration: number; width: number; height: number; framerate: number; hasAudio: boolean };
export type ClipPart = VideoInfo & { filePath: string };

function parseDuration(value: unknown) {
  if (value === undefined || value === null) {
    return Number.NaN;
  }
  const match = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(String(value));
  if (match) {
    return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  }

  return Number(value);
}

/** ffprobe next to ffmpeg (CS Demo Manager's FFmpeg build ships both), or null to read the info with ffmpeg. */
export function getFfprobePath(ffmpegPath: string) {
  const ffprobePath = path.join(path.dirname(ffmpegPath), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
  return fs.existsSync(ffprobePath) ? ffprobePath : null;
}

export async function probeVideo(ffmpegPath: string, filePath: string): Promise<VideoInfo> {
  const ffprobePath = getFfprobePath(ffmpegPath);
  if (!ffprobePath) {
    const { output } = await runProcess(ffmpegPath, ['-hide_banner', '-i', filePath]);
    const duration = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(output);
    const video = /Stream #\d+:\d+[^:]*: Video:[^\n]*?(\d{2,5})x(\d{2,5})[^\n]*?(\d+(?:\.\d+)?) fps/.exec(output);
    if (!duration || !video) {
      throw new Error(`Could not read ${filePath}: ${output.slice(-300)}`);
    }
    // The container duration includes a longer audio track: read the video stream's own length.
    const copy = await runProcess(ffmpegPath, ['-hide_banner', '-i', filePath, '-map', '0:v:0', '-c', 'copy', '-f', 'null', '-']);
    const times = [...copy.output.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)];
    const last = times.at(-1);
    const videoDuration = last ? Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3]) : 0;
    return {
      duration:
        videoDuration > 0 ? videoDuration : Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]),
      width: Number(video[1]),
      height: Number(video[2]),
      framerate: Number(video[3]),
      hasAudio: /Stream #\d+:\d+[^:]*: Audio:/.test(output),
    };
  }

  const { code, output } = await runProcess(ffprobePath, [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    filePath,
  ]);
  if (code !== 0) {
    throw new Error(`ffprobe failed on ${filePath}: ${output.slice(-300)}`);
  }
  type Stream = {
    codec_type: string;
    width?: number;
    height?: number;
    duration?: string;
    avg_frame_rate?: string;
    r_frame_rate?: string;
    tags?: { DURATION?: string };
  };
  const json = JSON.parse(output.slice(output.indexOf('{'))) as { streams: Stream[]; format?: { duration?: string } };
  const video = json.streams.find((stream) => stream.codec_type === 'video');
  if (!video) {
    throw new Error(`No video stream in ${filePath}`);
  }
  const duration =
    [parseDuration(video.duration), parseDuration(video.tags?.DURATION), parseDuration(json.format?.duration)].find(
      (value) => Number.isFinite(value) && value > 0,
    ) ?? 0;
  const [numerator, denominator] = String(video.avg_frame_rate || video.r_frame_rate || '0/1')
    .split('/')
    .map(Number);

  return {
    duration,
    width: video.width ?? 0,
    height: video.height ?? 0,
    framerate: denominator ? numerator / denominator : 0,
    hasAudio: json.streams.some((stream) => stream.codec_type === 'audio'),
  };
}

type ComposeOptions = {
  ffmpegPath: string;
  parts: ClipPart[];
  hud: HudFrames | null;
  framerate: number;
  crf: number;
  audioKbps: number;
  outputPath: string;
  signal?: AbortSignal;
  onProgress?: (ratio: number) => void;
};

/**
 * Joins the recorded parts, puts the HUD frames on top and writes the final MP4 (H.264 + AAC, faststart).
 * Each part's game audio is cut / padded to exactly that part's video length before joining, so a part whose WAV is a
 * few ms long can never push the next parts out of sync.
 */
export async function composeClip({
  ffmpegPath,
  parts,
  hud,
  framerate,
  crf,
  audioKbps,
  outputPath,
  signal,
  onProgress,
}: ComposeOptions) {
  const args = ['-y', '-hide_banner', '-loglevel', 'error', '-nostats', '-progress', 'pipe:1'];
  for (const part of parts) {
    args.push('-i', part.filePath);
  }
  const hudInputIndex = parts.length;
  if (hud) {
    args.push('-framerate', String(framerate), '-start_number', '0', '-i', hud.pattern);
  }

  const width = parts[0].width;
  const height = parts[0].height;
  const filters: string[] = [];
  const concatInputs: string[] = [];
  for (const [index, part] of parts.entries()) {
    const duration = part.duration.toFixed(4);
    filters.push(
      `[${index}:v:0]fps=${framerate},scale=${width}:${height}:flags=bicubic,setsar=1,setpts=PTS-STARTPTS,format=yuv420p[v${index}]`,
    );
    if (part.hasAudio) {
      filters.push(
        `[${index}:a:0]aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,asetpts=PTS-STARTPTS,apad,atrim=0:${duration}[a${index}]`,
      );
    } else {
      filters.push(`anullsrc=r=48000:cl=stereo,atrim=0:${duration}[a${index}]`);
    }
    concatInputs.push(`[v${index}][a${index}]`);
  }
  filters.push(`${concatInputs.join('')}concat=n=${parts.length}:v=1:a=1[cv][ca]`);
  if (hud) {
    const scale = width / 1920;
    const hudHeight = Math.round((hud.stripHeight * scale) / 2) * 2;
    filters.push(`[${hudInputIndex}:v]format=rgba${scale === 1 ? '' : `,scale=${width}:${hudHeight}:flags=lanczos`}[hud]`);
    filters.push(`[cv][hud]overlay=0:${height - hudHeight}:format=auto:eof_action=pass,format=yuv420p[outv]`);
  } else {
    filters.push('[cv]null[outv]');
  }
  args.push(
    '-filter_complex',
    filters.join(';'),
    '-map',
    '[outv]',
    '-map',
    '[ca]',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    String(crf),
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'high',
    '-r',
    String(framerate),
    '-g',
    String(Math.round(framerate * 2)),
    '-c:a',
    'aac',
    '-b:a',
    `${audioKbps}k`,
    '-ar',
    '48000',
    '-movflags',
    '+faststart',
    outputPath,
  );

  const totalSeconds = parts.reduce((sum, part) => sum + part.duration, 0);
  const { code, output } = await runProcess(ffmpegPath, args, {
    signal,
    onLine: (line) => {
      const match = /^out_time_(?:us|ms)=(\d+)/.exec(line);
      if (match && totalSeconds > 0) {
        onProgress?.(Math.min(1, Number(match[1]) / 1e6 / totalSeconds));
      }
    },
  });
  if (signal?.aborted) {
    throw new Error('Cancelled');
  }
  if (code !== 0) {
    throw new Error(`FFmpeg failed (exit ${code}): ${output.slice(-1500)}`);
  }
}

export async function createThumbnail(ffmpegPath: string, videoPath: string, atSeconds: number, outputPath: string) {
  const { code, output } = await runProcess(ffmpegPath, [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-ss',
    atSeconds.toFixed(2),
    '-i',
    videoPath,
    '-frames:v',
    '1',
    '-vf',
    'scale=960:-2',
    '-q:v',
    '3',
    outputPath,
  ]);
  if (code !== 0) {
    throw new Error(`Thumbnail failed: ${output.slice(-300)}`);
  }
}
