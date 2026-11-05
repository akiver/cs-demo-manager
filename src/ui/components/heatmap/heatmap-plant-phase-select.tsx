import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { BombPlantPhase } from 'csdm/common/types/bomb-plant-phase';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';

const wholeRound = 'whole-round';
type Value = BombPlantPhase | typeof wholeRound;

type Props = {
  plantPhase: BombPlantPhase | null;
  onChange: (plantPhase: BombPlantPhase | null) => void;
};

export function HeatmapPlantPhaseSelect({ plantPhase, onChange }: Props) {
  const { t } = useLingui();

  const options: SelectOption<Value>[] = [
    {
      value: wholeRound,
      label: t({
        context: 'Heatmap bomb plant phase',
        message: 'Whole round',
      }),
    },
    {
      value: BombPlantPhase.PrePlant,
      label: t({
        context: 'Heatmap bomb plant phase',
        message: 'Before the bomb plant',
      }),
    },
    {
      value: BombPlantPhase.PostPlant,
      label: t({
        context: 'Heatmap bomb plant phase',
        message: 'After the bomb plant',
      }),
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <Select
        options={options}
        value={plantPhase ?? wholeRound}
        onChange={(value) => {
          onChange(value === wholeRound ? null : value);
        }}
        label={<Trans context="Input label">Bomb plant</Trans>}
      />
    </div>
  );
}
