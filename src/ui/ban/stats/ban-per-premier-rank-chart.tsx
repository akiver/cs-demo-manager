import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CompetitiveRank, type PremierRank } from 'csdm/common/types/counter-strike';
import { NoBanMessage } from './no-ban-message';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { PremierRank as PremierRankLogo } from 'csdm/ui/components/premier-rank';
import { getPremierRankTier } from 'csdm/ui/shared/get-premier-rank-tier';

type Props = {
  bannedAccounts: BannedSteamAccount[];
};

export function BanPerPremierRankChart({ bannedAccounts }: Props) {
  const renderContent = () => {
    const banCountPerTier: Map<PremierRank, number> = new Map();

    for (const account of bannedAccounts) {
      if (account.rank <= CompetitiveRank.GlobalElite) {
        continue;
      }

      const tier = getPremierRankTier(account.rank);
      banCountPerTier.set(tier, (banCountPerTier.get(tier) ?? 0) + 1);
    }

    if (banCountPerTier.size === 0) {
      return <NoBanMessage />;
    }

    const maxBannedCount = Math.max(...banCountPerTier.values());

    return (
      <div className="mx-auto flex w-max gap-x-4">
        {[0, 1, 2, 3, 4, 5, 6].map((tier) => {
          const bannedCount = banCountPerTier.get(tier) ?? 0;

          return (
            <div key={tier} className="flex">
              <div className="flex h-[324px] flex-col items-center justify-end">
                {bannedCount > 0 && (
                  <Tooltip
                    content={
                      <Trans>
                        Tier {tier}: {bannedCount}
                      </Trans>
                    }
                    placement="top"
                  >
                    <div
                      className="flex w-40 animate-grow-height justify-center bg-blue-700"
                      style={{
                        height: `${(bannedCount / maxBannedCount) * 100}%`,
                      }}
                    >
                      <span className="text-white">{bannedCount}</span>
                    </div>
                  </Tooltip>
                )}
                <div className="mt-4 w-[64px]">
                  <PremierRankLogo rank={tier * 1000 * 5} />
                </div>
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
          <Trans context="Chart title">Ban per Premier rank</Trans>
        </PanelTitle>
      }
    >
      {renderContent()}
    </Panel>
  );
}
