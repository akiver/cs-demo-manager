import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { PlayDemoAtTickButton } from '../play-demo-at-tick-button';
import { Avatar as AvatarImage } from 'csdm/ui/components/avatar';
import { useCurrentMatch } from '../../use-current-match';
import type { Round } from 'csdm/common/types/round';
import type { Kill } from 'csdm/common/types/kill';
import type { Player } from 'csdm/common/types/player';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import { TeamText } from 'csdm/ui/components/team-text';
import { RoundEndReasonIcon } from 'csdm/ui/icons/round-end-reason-icon';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { CollapsePanel } from 'csdm/ui/components/collapse-panel/collapse-panel';
import type { Match } from 'csdm/common/types/match';

type AvatarsProps = {
  players: Player[];
  kills: Kill[];
};

function Avatars({ players, kills }: AvatarsProps) {
  return (
    <div className="flex gap-x-4">
      {players.map((player) => {
        const hasBeenKilled = kills.some((kill) => {
          return kill.victimSteamId === player.steamId;
        });

        const playerKills = kills.filter((kill) => {
          return kill.killerSteamId === player.steamId;
        });

        return (
          <div
            key={player.steamId}
            style={{
              opacity: hasBeenKilled ? 0.3 : 1,
            }}
          >
            <AvatarImage avatarUrl={player.avatar} playerName={player.name} size={44} playerColor={player.color} />
            <div className="flex gap-x-px mt-px">
              {playerKills.map((kill) => {
                return (
                  <div
                    key={kill.id}
                    className="w-8 h-8 rounded"
                    style={{
                      backgroundColor: getTeamColor(kill.killerSide),
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type EconomyRowProps = {
  title: ReactNode;
  valueTeamA: number;
  valueTeamB: number;
};

function EconomyRow({ valueTeamA, valueTeamB, title }: EconomyRowProps) {
  return (
    <div className="grid gap-8 grid-cols-[minmax(60px,_auto)_1fr_minmax(60px,_auto)] whitespace-nowrap">
      <p className="text-left">${valueTeamA}</p>
      <p className="text-center">{title}</p>
      <p className="text-right">${valueTeamB}</p>
    </div>
  );
}

type ContentProps = {
  kills: Kill[];
  round: Round;
  roundStartFrame: number;
};

function Content({ round, kills, roundStartFrame }: ContentProps) {
  const match = useCurrentMatch();

  return (
    <div className="flex gap-x-16 w-full">
      <div>
        {kills.map((kill) => {
          return (
            <KillFeedEntry
              key={kill.id}
              kill={kill}
              timeElapsedOption={{
                roundStartFrame,
                frameRate: match.frameRate,
              }}
            />
          );
        })}
      </div>
      <div>
        <EconomyRow title={<Trans>Cash</Trans>} valueTeamA={round.teamAStartMoney} valueTeamB={round.teamBStartMoney} />
        <EconomyRow
          title={<Trans>Cash spent</Trans>}
          valueTeamA={round.teamAMoneySpent}
          valueTeamB={round.teamBMoneySpent}
        />
        <EconomyRow
          title={<Trans>Equipment value</Trans>}
          valueTeamA={round.teamAEquipmentValue}
          valueTeamB={round.teamBEquipmentValue}
        />
      </div>
    </div>
  );
}

type PanelHeaderProps = {
  round: Round;
  playersTeamA: Player[];
  playersTeamB: Player[];
  kills: Kill[];
  match: Match;
};

function PanelHeader({ round, playersTeamA, playersTeamB, kills, match }: PanelHeaderProps) {
  const roundNumber = round.number;
  return (
    <>
      <p className="text-body-strong">
        <Trans>Round {roundNumber}</Trans>
      </p>
      <div className="flex items-center justify-center flex-1">
        <Avatars players={playersTeamA} kills={kills} />
        <TeamText teamNumber={round.teamASide} className="text-title mx-8">
          {round.teamAScore}
        </TeamText>
        <RoundEndReasonIcon round={round} />
        <TeamText teamNumber={round.teamBSide} className="text-title mx-8">
          {round.teamBScore}
        </TeamText>
        <Avatars players={playersTeamB} kills={kills} />
      </div>
      <PlayDemoAtTickButton
        demoPath={match.demoFilePath}
        game={match.game}
        tick={round.startTick}
        tooltip={<Trans context="Tooltip">Watch round</Trans>}
      />
    </>
  );
}

type Props = {
  round: Round;
};

export function RoundEntry({ round }: Props) {
  const match = useCurrentMatch();
  const playersTeamA = match.players.filter((player) => player.teamName === match.teamA.name);
  const playersTeamB = match.players.filter((player) => player.teamName === match.teamB.name);
  const kills = match.kills.filter((kill) => kill.roundNumber === round.number);

  return (
    <div>
      <CollapsePanel
        header={
          <PanelHeader
            kills={kills}
            match={match}
            round={round}
            playersTeamA={playersTeamA}
            playersTeamB={playersTeamB}
          />
        }
      >
        <Content round={round} kills={kills} roundStartFrame={round.startFrame} />
      </CollapsePanel>
    </div>
  );
}
