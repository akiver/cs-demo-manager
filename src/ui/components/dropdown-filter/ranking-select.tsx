import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RankingFilter } from 'csdm/common/types/ranking-filter';
import { Select, type SelectOption } from '../inputs/select';
import { ActiveFilterIndicator } from './active-filter-indicator';

type Props = {
  selectedRanking: RankingFilter;
  onChange: (ranking: RankingFilter) => void;
};

export function RankingSelect({ selectedRanking, onChange }: Props) {
  const options: SelectOption<RankingFilter>[] = [
    {
      value: RankingFilter.All,
      label: <Trans context="Option label for ranking filter">All</Trans>,
    },
    {
      value: RankingFilter.Ranked,
      label: <Trans context="Option label for ranking filter">Ranked</Trans>,
    },
    {
      value: RankingFilter.Unranked,
      label: <Trans context="Option label for ranking filter">Unranked</Trans>,
    },
  ];

  const hasActiveFilter = selectedRanking !== RankingFilter.All;

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <p>
          <Trans context="Ranking filter label">Ranking</Trans>
        </p>
        {hasActiveFilter && <ActiveFilterIndicator />}
      </div>
      <div>
        <Select options={options} value={selectedRanking} onChange={onChange} />
      </div>
    </div>
  );
}
