import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RecordingGameWidth } from './recording-game-width';
import { RecordingGameHeight } from './recording-game-height';
import { RecordingXRay } from './recording-x-ray';
import { RecordingPlayerVoices } from './recording-player-voices';
import { RecordingDeathNoticesDuration } from './recording-death-notices-duration';
import { RecordingShowOnlyDeathNotices } from './recording-show-only-death-notices';

export function DefaultVideoRecordingSettings() {
  return (
    <div>
      <h2 className="text-subtitle mb-8">
        <Trans>Default recording settings</Trans>
      </h2>
      <div className="flex flex-col gap-y-8">
        <RecordingGameWidth />
        <RecordingGameHeight />
        <RecordingXRay />
        <RecordingPlayerVoices />
        <RecordingShowOnlyDeathNotices />
        {window.csdm.isWindows && <RecordingDeathNoticesDuration />}
      </div>
    </div>
  );
}
