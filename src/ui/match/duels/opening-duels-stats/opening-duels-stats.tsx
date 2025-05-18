import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import type { Kill } from 'csdm/common/types/kill';
import { Tooltip } from 'csdm/ui/components/tooltip';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import { Avatar } from 'csdm/ui/components/avatar';
import { Content } from 'csdm/ui/components/content';
import { OpeningDuelResult } from 'csdm/common/types/opening-duel-result';
import { OpeningDuelResultSelect } from 'csdm/ui/components/inputs/select/opening-duel-result-select';
import { roundNumberPercentage } from 'csdm/common/math/round-number-percentage';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { SideSelect } from 'csdm/ui/components/inputs/select/side-select';
import { getCssVariableValue } from 'csdm/ui/shared/get-css-variable-value';
import { OpeningDuelsRoundBreakdown } from './opening-duels-round-breakdown';
import { Section } from 'csdm/ui/components/section';

type PlayerStats = {
  steamId: string;
  name: string;
  avatar: string | null;
  wonCount: number;
  lostCount: number;
};

type TeamChartProps = {
  teamName: string;
  players: MatchPlayer[];
  kills: Kill[];
  result: OpeningDuelResult | undefined;
  sides: TeamNumber[];
};

function TeamChart({ teamName, players, kills, result, sides }: TeamChartProps) {
  const playersStats: PlayerStats[] = [];
  let openDuelTeamWonCount = 0;
  let openDuelTeamLostCount = 0;
  let openDuelTeamCount = 0;
  for (const player of players) {
    let wonCount = 0;
    if (!result || result === OpeningDuelResult.Won) {
      wonCount = kills.filter((kill) => {
        return kill.killerSteamId === player.steamId && (sides.length === 0 || sides.includes(kill.killerSide));
      }).length;
    }
    let lostCount = 0;
    if (!result || result === OpeningDuelResult.Lost) {
      lostCount = kills.filter((kill) => {
        return kill.victimSteamId === player.steamId && (sides.length === 0 || sides.includes(kill.victimSide));
      }).length;
    }

    playersStats.push({
      steamId: player.steamId,
      name: player.name,
      avatar: player.avatar,
      wonCount,
      lostCount,
    });

    openDuelTeamWonCount += wonCount;
    openDuelTeamLostCount += lostCount;
    const total = wonCount + lostCount;
    openDuelTeamCount += total;

    const maxOpenKillCountTeam = Number.parseFloat(getCssVariableValue('--max-opening-duel-count'));
    if (isNaN(maxOpenKillCountTeam) || maxOpenKillCountTeam < total) {
      document.documentElement.style.setProperty('--max-opening-duel-count', String(total));
    }
  }

  const openDuelWonPercentage = roundNumberPercentage(openDuelTeamWonCount / openDuelTeamCount);
  const openDuelLostPercentage = roundNumberPercentage(openDuelTeamLostCount / openDuelTeamCount);

  return (
    <div className="flex flex-col border border-gray-300 bg-gray-75 rounded p-8">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <p className="text-body-strong">{teamName}</p>
          <p className="text-subtitle">{openDuelTeamCount}</p>
        </div>

        <div className="flex w-full gap-x-4 my-4">
          <div
            className="h-4 rounded-full bg-blue-700 transition-all duration-300"
            style={{
              width: `${openDuelWonPercentage}%`,
            }}
          />
          <div
            className="h-4 rounded-full bg-red-700 transition-all duration-300"
            style={{
              width: `${openDuelLostPercentage}%`,
            }}
          />
        </div>

        <div className="flex justify-between gap-x-8">
          <div className="flex flex-col">
            <p className="text-subtitle text-blue-700">
              <Trans>{openDuelWonPercentage}%</Trans>
            </p>
            <p>
              <Trans>Opening duels won</Trans>
            </p>
          </div>

          <div className="flex flex-col">
            <p className="text-subtitle text-red-700 text-right">
              <Trans>{openDuelLostPercentage}%</Trans>
            </p>
            <p>
              <Trans>Opening duels lost</Trans>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-x-12 mt-8">
        {playersStats.map(({ steamId, avatar, name, wonCount, lostCount }) => {
          const openingDuelCount = wonCount + lostCount;
          return (
            <div key={steamId} className="flex">
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center h-[284px] gap-y-4 justify-end">
                  {lostCount > 0 && (
                    <Tooltip content={<Trans>Open duels lost: {lostCount}</Trans>} placement="top">
                      <div
                        className="w-40 bg-red-700 flex justify-center animate-grow-height transition-all duration-300"
                        style={{
                          height: `calc(${lostCount}/var(--max-opening-duel-count) * 100%)`,
                        }}
                      >
                        <span className="text-white">{lostCount}</span>
                      </div>
                    </Tooltip>
                  )}
                  {wonCount > 0 && (
                    <Tooltip content={<Trans>Open duels won: {wonCount}</Trans>} placement="top">
                      <div
                        className="w-40 bg-blue-700 flex justify-center animate-grow-height transition-all duration-300"
                        style={{
                          height: `calc(${wonCount}/var(--max-opening-duel-count) * 100%)`,
                        }}
                      >
                        <span className="text-white">{wonCount}</span>
                      </div>
                    </Tooltip>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <Tooltip
                    content={
                      <Trans>
                        Open duels: <strong>{openingDuelCount}</strong>
                      </Trans>
                    }
                    placement="top"
                  >
                    <div className="text-body-strong my-4 p-4 border border-gray-400 w-40 text-center">
                      <p>{openingDuelCount}</p>
                    </div>
                  </Tooltip>
                  <Avatar avatarUrl={avatar} playerName={name} size={48} />
                  <p className="w-[72px] text-center truncate" title={name}>
                    {name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OpeningDuelsStats() {
  const match = useCurrentMatch();
  const teamNameA = match.teamA.name;
  const teamNameB = match.teamB.name;
  const playersTeamA = match.players.filter((player) => player.teamName === teamNameA);
  const playersTeamB = match.players.filter((player) => player.teamName === teamNameB);
  const [selectedResult, setSelectedResult] = useState<OpeningDuelResult | undefined>(undefined);
  const [selectedSides, setSelectedSides] = useState<TeamNumber[]>([]);

  const openingKills: Kill[] = [];
  for (const kill of match.kills) {
    if (openingKills.some((k) => k.roundNumber === kill.roundNumber)) {
      continue;
    }

    openingKills.push(kill);
  }

  return (
    <Content>
      <div className="flex flex-wrap gap-16">
        <div className="flex flex-col">
          <div className="flex items-center gap-16">
            <OpeningDuelResultSelect
              selectedResult={selectedResult}
              onChange={(result) => {
                setSelectedResult(result);
              }}
            />
            <SideSelect
              selectedSides={selectedSides}
              onChange={(side) => {
                setSelectedSides(side === undefined ? [] : [side]);
              }}
            />
          </div>
          <div className="flex items-center gap-x-16 mt-12">
            <TeamChart
              teamName={teamNameA}
              players={playersTeamA}
              kills={openingKills}
              result={selectedResult}
              sides={selectedSides}
            />
            <TeamChart
              teamName={teamNameB}
              players={playersTeamB}
              kills={openingKills}
              result={selectedResult}
              sides={selectedSides}
            />
          </div>
        </div>

        <Section title={<Trans>Round breakdown</Trans>}>
          <OpeningDuelsRoundBreakdown openingKills={openingKills} />
        </Section>
      </div>
    </Content>
  );
}
