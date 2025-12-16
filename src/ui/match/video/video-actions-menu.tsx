import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { KebabMenu, KebabMenuItem } from 'csdm/ui/components/kebab-menu';
import { useClipboard } from 'csdm/ui/hooks/use-clipboard';
import { useCurrentMatchSequences } from './sequences/use-current-match-sequences';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { useCurrentMatch } from '../use-current-match';
import type { VideoCommandConfig } from 'csdm/cli/commands/video-command';
import type { SaveDialogOptions } from 'electron';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

function useGetVideoCommandConfig(): () => VideoCommandConfig {
  const sequences = useCurrentMatchSequences();
  const { settings } = useVideoSettings();
  const match = useCurrentMatch();

  return () => {
    return {
      demoPath: match.demoFilePath,
      outputFolderPath: settings.outputFolderPath,
      recordingSystem: settings.recordingSystem,
      recordingOutput: settings.recordingOutput,
      encoderSoftware: settings.encoderSoftware,
      width: settings.width,
      height: settings.height,
      framerate: settings.framerate,
      closeGameAfterRecording: settings.closeGameAfterRecording,
      concatenateSequences: settings.concatenateSequences,
      ffmpegSettings: settings.ffmpegSettings,
      sequences,
    };
  };
}

export function VideoActionsMenu() {
  const { copyToClipboard } = useClipboard();
  const showToast = useShowToast();
  const getVideoCommandConfig = useGetVideoCommandConfig();
  const { t } = useLingui();

  const onCopyClick = async () => {
    await copyToClipboard(JSON.stringify(getVideoCommandConfig(), null, 2));
  };

  const onExportClick = async () => {
    const options: SaveDialogOptions = {
      defaultPath: 'video',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    };
    const { canceled, filePath } = await window.csdm.showSaveDialog(options);
    if (!canceled && filePath) {
      try {
        await window.csdm.writeJsonFile(filePath, JSON.stringify(getVideoCommandConfig(), null, 2));

        showToast({
          id: 'export-video-json-success',
          content: <Trans context="Toast">File created, click here to reveal it</Trans>,
          type: 'success',
          onClick: () => {
            window.csdm.browseToFile(filePath);
          },
        });
      } catch (error) {
        showToast({
          id: 'export-video-json-error',
          content: <Trans>An error occurred</Trans>,
          type: 'error',
        });
      }
    }
  };

  return (
    <KebabMenu label={t`Video actions`}>
      <KebabMenuItem onClick={onCopyClick}>
        <Trans context="Button">Copy as JSON</Trans>
      </KebabMenuItem>
      <KebabMenuItem onClick={onExportClick}>
        <Trans context="Button">Export as JSON</Trans>
      </KebabMenuItem>
    </KebabMenu>
  );
}
