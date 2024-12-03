import React, { type ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';

type Props = {
  title: ReactNode;
  description: ReactNode;
  defaultValue: number;
  onChange: (seconds: number) => void;
};

export function WatchBeforeKillDelay({ title, description, defaultValue, onChange }: Props) {
  const { t } = useLingui();
  const minSeconds = 0;
  const maxSeconds = 30;

  const onBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = Number.parseInt(event.target.value);
    if (seconds !== defaultValue && seconds >= minSeconds && seconds <= maxSeconds) {
      onChange(seconds);
    }
  };

  return (
    <SettingsEntry
      interactiveComponent={
        <InputNumber
          onBlur={onBlur}
          placeholder={t({
            context: 'Input placeholder',
            message: 'Delay (seconds)',
          })}
          defaultValue={String(defaultValue)}
          min={minSeconds}
          max={maxSeconds}
        />
      }
      description={description}
      title={title}
    />
  );
}
