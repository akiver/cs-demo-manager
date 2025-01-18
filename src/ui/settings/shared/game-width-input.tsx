import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';

type Props = {
  width: number;
  onBlur: (width: number | undefined) => void;
};

export function GameWidthInput({ width, onBlur }: Props) {
  const { t } = useLingui();

  return (
    <SettingsEntry
      interactiveComponent={
        <InputNumber
          onBlur={(event) => {
            const width = Number.parseInt(event.target.value);
            onBlur(isNaN(width) ? undefined : width);
          }}
          placeholder={t({
            context: 'Input placeholder',
            message: 'Width',
          })}
          defaultValue={width}
          min={800}
        />
      }
      description={<Trans>Set the game width resolution.</Trans>}
      title={<Trans context="Settings title">Width</Trans>}
    />
  );
}
