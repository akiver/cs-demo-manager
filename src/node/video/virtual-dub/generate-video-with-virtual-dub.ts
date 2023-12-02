import path from 'node:path';
import { exec } from 'node:child_process';
import fs from 'fs-extra';
import type { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getVirtualDubFolderPath } from 'csdm/node/video/virtual-dub/get-virtual-dub-folder-path';
import { getVirtualDubExecutablePath } from 'csdm/node/video/virtual-dub/get-virtual-dub-executable-path';
import { abortError } from 'csdm/node/errors/abort-error';
import { VirtualDubError } from 'csdm/node/video/errors/virtual-dub-error';
import { getSequenceOutputFilePath } from 'csdm/node/video/sequences/get-sequence-output-file-path';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';
import { getSequenceRawFiles } from 'csdm/node/video/sequences/get-sequence-raw-files';

type GenerateVideoWithVirtualDubSettings = {
  game: Game;
  rawFilesFolderPath: string;
  outputFolderPath: string;
  framerate: number;
  sequence: Sequence;
};

const SCRIPT_FILENAME = 'csdm.jobs';

// The path separator in VirtualDub scripts must be "\\".
// Example: C:\\Users\\username\\Desktop
function sanitizePath(path: string) {
  return path.replace(/\/|\\/gi, '\\\\');
}

function generateVirtualDubScript(
  framerate: number,
  firstTgaFilePath: string,
  wavFilePath: string,
  tgaFilesCount: number,
  videoFilePath: string,
) {
  return `
      VirtualDub.Open("${firstTgaFilePath}","",0);
  VirtualDub.audio.SetSource("${wavFilePath}", "");
  VirtualDub.audio.SetMode(0);
  VirtualDub.audio.SetInterleave(1, 500, 1, 0, 0);
  VirtualDub.audio.SetClipMode(1, 1);
  VirtualDub.audio.SetEditMode(1);
  VirtualDub.audio.SetConversion(0, 0, 0, 0, 0);
  VirtualDub.audio.SetVolume();
  VirtualDub.audio.SetCompression();
  VirtualDub.audio.EnableFilterGraph(0);
  VirtualDub.video.SetInputFormat(0);
  VirtualDub.video.SetOutputFormat(7);
  VirtualDub.video.SetMode(3);
  VirtualDub.video.SetSmartRendering(0);
  VirtualDub.video.SetPreserveEmptyFrames(0);
  VirtualDub.video.SetFrameRate2(${framerate}, 1, 1);
  VirtualDub.video.SetIVTC(0, 0, 0, 0);
  VirtualDub.video.SetCompression();
  VirtualDub.video.filters.Clear();
  VirtualDub.audio.filters.Clear();
  VirtualDub.subset.Clear();
  VirtualDub.subset.AddRange(0, ${tgaFilesCount});
  VirtualDub.video.SetRange();
  VirtualDub.project.ClearTextInfo();
  VirtualDub.SaveAVI("${videoFilePath}");
  VirtualDub.audio.SetSource(1);
  VirtualDub.Close();
  `;
}

async function writeVirtualDubScript({
  sequence,
  rawFilesFolderPath,
  outputFolderPath,
  game,
  framerate,
}: GenerateVideoWithVirtualDubSettings) {
  const { tgaFiles, wavFilePath } = await getSequenceRawFiles(sequence, rawFilesFolderPath, game);

  const outputFilePath = windowsToUnixPathSeparator(getSequenceOutputFilePath(outputFolderPath, sequence));

  const script = generateVirtualDubScript(
    framerate,
    sanitizePath(tgaFiles[0]),
    sanitizePath(wavFilePath),
    tgaFiles.length,
    outputFilePath,
  );
  const scriptFilePath = path.join(getVirtualDubFolderPath(), SCRIPT_FILENAME);
  await fs.writeFile(scriptFilePath, script);
}

async function executeVirtualDub(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      return reject(abortError);
    }

    const command = `"${getVirtualDubExecutablePath()}" /s ${SCRIPT_FILENAME} /x`;
    logger.log('Starting VirtualDub', command);
    const virtualDubProcess = exec(command, {
      cwd: getVirtualDubFolderPath(),
      windowsHide: true,
    });

    virtualDubProcess.on('exit', (code) => {
      logger.log('VirtualDub exit', code);
      if (signal.aborted) {
        return reject(abortError);
      }

      if (code === 0) {
        resolve();
      } else {
        // VirtualDub is a GUI program, we can't get the output from stderr, if there is an error it will be shown in the GUI.
        reject(new VirtualDubError());
      }
    });
  });
}

export async function generateVideoWithVirtualDub(settings: GenerateVideoWithVirtualDubSettings, signal: AbortSignal) {
  await writeVirtualDubScript(settings);
  await executeVirtualDub(signal);
}
