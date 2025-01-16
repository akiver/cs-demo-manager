import React, { useId } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import type { KillCameraPov } from './generate-cameras-form';

type Props = {
  pov: KillCameraPov | undefined;
  onPovChange: (pov: KillCameraPov | undefined) => void;
  beforeKillDelaySeconds: number;
  onBeforeKillDelaySecondsChange: (beforeKillDelaySeconds: number) => void;
};

export function KillFocusCameraPovSelect({
  pov,
  onPovChange,
  beforeKillDelaySeconds,
  onBeforeKillDelaySecondsChange,
}: Props) {
  const { t } = useLingui();
  const id = useId();
  const options: SelectOption<KillCameraPov>[] = [
    {
      value: 'killer',
      label: t({
        context: 'Select option',
        message: 'Killer',
      }),
    },
    {
      value: 'victim',
      label: t({
        context: 'Select option',
        message: 'Victim',
      }),
    },
  ];

  const hasPovSelected = pov !== undefined;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-y-8">
        <div className="flex gap-x-8">
          <Checkbox
            label={
              <Trans context="Checkbox label">
                Focus the camera on the killer or victim a few seconds before each kill
              </Trans>
            }
            isChecked={hasPovSelected}
            onChange={(event) => {
              if (event.target.checked) {
                onPovChange('killer');
              } else {
                onPovChange(undefined);
              }
            }}
          />
        </div>
        <div className="flex items-center gap-x-12">
          <Select
            options={options}
            isDisabled={!hasPovSelected}
            value={pov}
            onChange={(pov: KillCameraPov) => {
              onPovChange(pov);
            }}
          />

          <div className="flex items-center gap-x-8">
            <InputLabel htmlFor={id}>
              <Trans context="Input label">Seconds</Trans>
            </InputLabel>
            <div className="w-[5rem]">
              <InputNumber
                id={id}
                min={1}
                max={30}
                isDisabled={!hasPovSelected}
                placeholder={String(1)}
                defaultValue={beforeKillDelaySeconds}
                onChange={(event) => {
                  const input = event.target as HTMLInputElement;
                  onBeforeKillDelaySecondsChange(Number(input.value));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
