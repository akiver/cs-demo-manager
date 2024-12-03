import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import { NoBanMessage } from './no-ban-message';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useGetRankName } from 'csdm/ui/hooks/use-get-rank-name';

type Props = {
  bannedAccounts: BannedSteamAccount[];
};

export function BanPerCompetitiveRankChart({ bannedAccounts }: Props) {
  const getRankName = useGetRankName();

  const renderContent = () => {
    const banCountPerRank: Map<CompetitiveRank, number> = new Map();

    for (const account of bannedAccounts) {
      if (account.rank > CompetitiveRank.GlobalElite) {
        continue;
      }

      const rank = account.rank as CompetitiveRank;
      banCountPerRank.set(rank, (banCountPerRank.get(rank) ?? 0) + 1);
    }

    if (banCountPerRank.size === 0) {
      return <NoBanMessage />;
    }

    const maxBannedCount = Math.max(...banCountPerRank.values());

    return (
      <div className="flex gap-x-4 w-max mx-auto">
        {Object.values(CompetitiveRank).map((rankNumber) => {
          const bannedCount = banCountPerRank.get(rankNumber) ?? 0;
          const rankName = getRankName(rankNumber);

          return (
            <div key={rankNumber} className="flex">
              <div className="flex flex-col items-center h-[324px] justify-end">
                {bannedCount > 0 && (
                  <Tooltip content={`${rankName}: ${bannedCount}`} placement="top">
                    <div
                      className="w-40 bg-blue-700 flex justify-center animate-grow-height"
                      style={{
                        height: `${(bannedCount / maxBannedCount) * 100}%`,
                      }}
                    >
                      <span className="text-white">{bannedCount}</span>
                    </div>
                  </Tooltip>
                )}
                <img
                  className="w-[64px] mt-4"
                  src={window.csdm.getRankImageSrc(rankNumber)}
                  alt={rankName}
                  title={rankName}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Chart title">Ban per competitive rank</Trans>
        </PanelTitle>
      }
    >
      {renderContent()}
    </Panel>
  );
}
