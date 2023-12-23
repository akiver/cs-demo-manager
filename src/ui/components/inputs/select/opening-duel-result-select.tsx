import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { OpeningDuelResult } from 'csdm/common/types/opening-duel-result';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';

type Props = {
  selectedResult: OpeningDuelResult | undefined;
  onChange: (result: OpeningDuelResult | undefined) => void;
};

export function OpeningDuelResultSelect({ onChange, selectedResult }: Props) {
  const _ = useI18n();
  const results: SelectOption<OpeningDuelResult>[] = [
    {
      value: OpeningDuelResult.Won,
      label: _(
        msg({
          context: 'Opening duel result select option',
          message: 'Won',
        }),
      ),
    },
    {
      value: OpeningDuelResult.Lost,
      label: _(
        msg({
          context: 'Opening duel result select option',
          message: 'Lost',
        }),
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <p>
        <Trans context="Opening duel result filter category">Opening duel result</Trans>
      </p>
      <div className="flex flex-wrap gap-4">
        {results.map((result) => {
          const isSelected = selectedResult === result.value;

          return (
            <FilterValue
              key={result.value}
              isSelected={isSelected}
              onClick={() => {
                onChange(isSelected ? undefined : result.value);
              }}
            >
              {result.label}
            </FilterValue>
          );
        })}
      </div>
    </div>
  );
}
