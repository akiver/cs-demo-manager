import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { PlayDemoAtTickButton } from '../play-demo-at-tick-button';
import { Avatar as AvatarImage } from 'csdm/ui/components/avatar';
import { useCurrentMatch } from '../../use-current-match';
import type { Round } from 'csdm/common/types/round';
import type { Kill } from 'csdm/common/types/kill';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import { TeamText } from 'csdm/ui/components/team-text';
import { RoundEndReasonIcon } from 'csdm/ui/icons/round-end-reason-icon';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { CollapsePanel } from 'csdm/ui/components/collapse-panel/collapse-panel';
import type { Match } from 'csdm/common/types/match';
import { useTranslateEconomyType } from '../../economy/team-economy-breakdown/use-translate-economy-type';
import { useFormatMoney } from 'csdm/ui/hooks/use-format-money';

type AvatarsProps = {
  players: MatchPlayer[];
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
                    className="size-8 rounded"
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

type RowProps = {
  title: ReactNode;
  valueTeamA: string;
  valueTeamB: string;
};

function Row({ valueTeamA, valueTeamB, title }: RowProps) {
  return (
    <div className="grid gap-8 grid-cols-[minmax(60px,auto)_1fr_minmax(60px,auto)] whitespace-nowrap">
      <p className="text-left">{valueTeamA}</p>
      <p className="text-center">{title}</p>
      <p className="text-right">{valueTeamB}</p>
    </div>
  );
}

type ContentProps = {
  kills: Kill[];
  round: Round;
  roundFreezetimeEndTick: number;
};

function Content({ round, kills, roundFreezetimeEndTick }: ContentProps) {
  const match = useCurrentMatch();
  const { translateEconomyType } = useTranslateEconomyType();
  const formatMoney = useFormatMoney();

  return (
    <div className="flex gap-x-16 w-full">
      <div>
        {kills.map((kill) => {
          return (
            <KillFeedEntry
              key={kill.id}
              kill={kill}
              timeElapsedOption={{
                roundFreezetimeEndTick: roundFreezetimeEndTick,
                tickrate: match.tickrate,
              }}
            />
          );
        })}
      </div>
      <div>
        <Row
          title={<Trans>Cash</Trans>}
          valueTeamA={formatMoney(round.teamAStartMoney)}
          valueTeamB={formatMoney(round.teamBStartMoney)}
        />
        <Row
          title={<Trans>Cash spent</Trans>}
          valueTeamA={formatMoney(round.teamAMoneySpent)}
          valueTeamB={formatMoney(round.teamBMoneySpent)}
        />
        <Row
          title={<Trans>Equipment value</Trans>}
          valueTeamA={formatMoney(round.teamAEquipmentValue)}
          valueTeamB={formatMoney(round.teamBEquipmentValue)}
        />
        <Row
          title={<Trans>Economy type</Trans>}
          valueTeamA={translateEconomyType(round.teamAEconomyType)}
          valueTeamB={translateEconomyType(round.teamBEconomyType)}
        />
      </div>
    </div>
  );
}

type PanelHeaderProps = {
  round: Round;
  playersTeamA: MatchPlayer[];
  playersTeamB: MatchPlayer[];
  kills: Kill[];
  match: Match;
};

function PanelHeader({ round, playersTeamA, playersTeamB, kills, match }: PanelHeaderProps) {
  const roundNumber = round.number;
  const bombExploded = match.bombsExploded.find((bomb) => bomb.roundNumber === roundNumber);
  const bombDefused = match.bombsDefused.find((bomb) => bomb.roundNumber === roundNumber);
  const bombEventSite = bombExploded?.site || bombDefused?.site;

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
        <div className="flex flex-col items-center">
          <RoundEndReasonIcon round={round} />
          {bombEventSite && (
            <p
              className="text-subtitle"
              style={{
                color: getTeamColor(round.winnerSide),
              }}
            >
              {bombEventSite}
            </p>
          )}
        </div>
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
        <Content round={round} kills={kills} roundFreezetimeEndTick={round.freezetimeEndTick} />
      </CollapsePanel>
    </div>
  );
}
