import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

export function ToggleTrueView() {
  const { settings, updateSettings } = useVideoSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      trueView: event.target.checked,
    });
  };

  return (
    <div className="flex items-center gap-x-8">
      <Checkbox
        label={<Trans context="Checkbox label">Enable TrueView mode</Trans>}
        onChange={onChange}
        isChecked={settings.trueView}
      />

      <Tooltip
        content={
          <p>
            <Trans>Enabling TrueView may lead to lags in recordings!</Trans>
          </p>
        }
      >
        <ExclamationTriangleIcon className="size-12 text-red-400" />
      </Tooltip>
    </div>
  );
}
