import React from 'react';
import { PlayerCompetitiveRankHistory } from './player-competitive-rank-history';
import { Content } from 'csdm/ui/components/content';
import { PlayerPremierRankHistory } from './player-premier-rank-history';

export function PlayerRank() {
  return (
    <Content>
      <PlayerPremierRankHistory />
      <PlayerCompetitiveRankHistory />
    </Content>
  );
}
