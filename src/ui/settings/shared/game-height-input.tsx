import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';

type Props = {
  height: number;
  onBlur: (height: number | undefined) => void;
};

export function GameHeightInput({ height, onBlur }: Props) {
  const { t } = useLingui();

  return (
    <SettingsEntry
      interactiveComponent={
        <InputNumber
          onBlur={(event) => {
            const height = Number.parseInt(event.target.value);
            onBlur(isNaN(height) ? undefined : height);
          }}
          placeholder={t({
            context: 'Input placeholder',
            message: 'Height',
          })}
          defaultValue={height}
          min={600}
        />
      }
      description={<Trans>Set the game height resolution.</Trans>}
      title={<Trans context="Settings title">Height</Trans>}
    />
  );
}
