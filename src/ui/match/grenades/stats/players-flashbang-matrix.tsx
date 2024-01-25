import React, { useRef } from 'react';
import { Trans } from '@lingui/macro';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { roundNumber } from 'csdm/common/math/round-number';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getColorAtPercentage, hexToRgb } from 'csdm/ui/shared/colors';
import { ExportPlayersFlashbangMatrixButton } from 'csdm/ui/match/grenades/stats/export-players-flashbang-matrix-button';
import { useCssVariableValue } from 'csdm/ui/hooks/use-css-variable-value';

function TeamIndicator({ color }: { color: string }) {
  return (
    <div
      className="flex self-center size-8 rounded-full"
      style={{
        backgroundColor: color,
      }}
    />
  );
}

type PlayerInfo = {
  steamId: string;
  name: string;
  teamName: string;
};

type DataPerSteamID = { [steamId: string]: { [steamId: string]: number } };

export function PlayersFlashbangMatrix() {
  const match = useCurrentMatch();
  const chart = useRef<HTMLDivElement | null>(null);
  const startColor = hexToRgb(useCssVariableValue('--gray-100'));
  const endColor = hexToRgb('#095aba');

  const players = [...match.players].sort((playerA, playerB) => {
    return playerA.teamName.localeCompare(playerB.teamName);
  });

  const playersInfo: PlayerInfo[] = [];
  const data: DataPerSteamID = {};
  let maxDuration = 0;

  for (let column = 0; column < players.length; column++) {
    const player = players[column];
    playersInfo.push({
      steamId: player.steamId,
      name: player.name,
      teamName: player.teamName,
    });

    const playerBlinds = match.blinds.filter((blind) => {
      return blind.flasherSteamId === player.steamId && !blind.isFlasherControllingBot;
    });

    const durationPerSteamId: Record<string, number> = {};

    for (const player of players) {
      const duration = playerBlinds
        .filter((blind) => {
          return blind.flashedSteamId === player.steamId && !blind.isFlashedControllingBot;
        })
        .reduce((previousDuration, { duration }) => {
          return previousDuration + duration;
        }, 0);

      durationPerSteamId[player.steamId] = durationPerSteamId[player.steamId]
        ? durationPerSteamId[player.steamId] + duration
        : duration;

      if (duration > maxDuration) {
        maxDuration = duration;
      }
    }

    data[player.steamId] = durationPerSteamId;
  }

  return (
    <Panel
      header={
        <div className="flex items-center gap-x-16">
          <PanelTitle>
            <Trans>Players flashbang matrix</Trans>
          </PanelTitle>
          <ExportPlayersFlashbangMatrixButton getMatrixElement={() => chart.current} />
        </div>
      }
    >
      <div className="flex flex-col w-fit" ref={chart}>
        {playersInfo.map((playerA) => {
          const teamColor = getTeamColor(playerA.teamName === match.teamA.name ? TeamNumber.CT : TeamNumber.T);

          return (
            <div key={playerA.steamId} className="flex">
              <div className="flex items-center gap-x-8">
                <p className="w-[128px] truncate selectable" title={playerA.name}>
                  {playerA.name}
                </p>
                <TeamIndicator color={teamColor} />
              </div>
              <div className="flex ml-8">
                {playersInfo.map((playerB) => {
                  const duration = data[playerA.steamId][playerB.steamId] ?? 0;
                  const roundedDuration = roundNumber(duration, 1);
                  const flasherName = playerA.name;
                  const flashedName = playerB.name;

                  return (
                    <div key={playerB.steamId} className="flex flex-col w-[84px]">
                      <Tooltip
                        content={
                          <Trans>
                            <span className="text-body-strong">{flasherName}</span> flashed{' '}
                            <span className="text-body-strong">{flashedName}</span> around{' '}
                            <span className="text-body-strong">{roundedDuration}s</span>
                          </Trans>
                        }
                        delay={0}
                        placement="top"
                      >
                        <div
                          className="flex flex-col p-8 border text-body-strong text-center hover:scale-110 transition-transform duration-100 selectable"
                          style={{
                            backgroundColor: getColorAtPercentage(startColor, endColor, (duration / maxDuration) * 100),
                          }}
                        >
                          {roundedDuration}
                        </div>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="flex mt-8">
          <div className="flex w-[152px]" />
          {playersInfo.map((player) => {
            const teamColor = getTeamColor(player.teamName === match.teamA.name ? TeamNumber.CT : TeamNumber.T);

            return (
              <div key={player.steamId} className="flex flex-col gap-y-4 w-[84px]">
                <TeamIndicator color={teamColor} />
                <p className="overflow-hidden break-words selectable" title={player.name}>
                  {player.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
