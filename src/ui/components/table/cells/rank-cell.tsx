import React from 'react';
import { CompetitiveRank, type Rank } from 'csdm/common/types/counter-strike';
import type { CellProps } from '../table-types';
import { PremierRank } from 'csdm/ui/components/premier-rank';
import { useGetRankName } from 'csdm/ui/hooks/use-get-rank-name';

type Props = CellProps<{ rank: Rank }>;

export function RankCell({ data }: Props) {
  const rank = data.rank;
  const getRankName = useGetRankName();

  if (data.rank > CompetitiveRank.GlobalElite) {
    return <PremierRank rank={data.rank} />;
  }

  const rankImageSrc = window.csdm.getRankImageSrc(rank);
  const rankName = getRankName(rank);

  return <img src={rankImageSrc} alt={rankName} title={rankName} />;
}
