import React, { useState } from 'react';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { DEFAULT_DEATH_NOTICES_DURATION } from 'csdm/ui/settings/video/default-values';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Trans } from '@lingui/macro';
import { useCurrentMatch } from '../use-current-match';
import { Game } from 'csdm/common/types/counter-strike';

export function DeathNoticesDurationInput() {
  const { settings, updateSettings } = useVideoSettings();
  const [duration, setDuration] = useState<string>(String(settings.deathNoticesDuration));
  const match = useCurrentMatch();

  // The HLAE command mirv_deathmsg is not available for CS2 yet
  if (match.game !== Game.CSGO) {
    return null;
  }

  const onBlur = async () => {
    let newDuration = Number(duration);
    if (duration === '') {
      newDuration = DEFAULT_DEATH_NOTICES_DURATION;
      setDuration(String(newDuration));
    }

    await updateSettings({
      deathNoticesDuration: newDuration,
    });
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(event.target.value);
  };

  return (
    <InputNumber
      id="death-notices-duration"
      label={<Trans>Death notices duration (seconds)</Trans>}
      min={0}
      onChange={onChange}
      value={duration}
      onBlur={onBlur}
    />
  );
}
