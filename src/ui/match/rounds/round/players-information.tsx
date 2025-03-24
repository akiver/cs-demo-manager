import React from 'react';
import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { GrenadeName, EconomyType } from 'csdm/common/types/counter-strike';
import { useCurrentRound } from './use-current-round';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Avatar } from 'csdm/ui/components/avatar';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import type { Shot } from 'csdm/common/types/shot';
import type { Damage } from 'csdm/common/types/damage';
import type { Kill } from 'csdm/common/types/kill';
import type { PlayerEconomy } from 'csdm/common/types/player-economy';
import { roundNumber } from 'csdm/common/math/round-number';
import type { Round } from 'csdm/common/types/round';
import type { ChickenDeath } from 'csdm/common/types/chicken-death';
import { useFormatMoney } from 'csdm/ui/hooks/use-format-money';
import { useTranslateEconomyType } from 'csdm/ui/match/economy/team-economy-breakdown/use-translate-economy-type';

function MainGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr]"
      style={{
        gridTemplateAreas: `
          'header-left header-middle header-right'
          'gameplay-title-left gameplay-title gameplay-title-right'
          'gameplay-team-a gameplay-types gameplay-team-b'
          'kills-title-left kills-title kills-title-right'
          'kills-team-a kills-types kills-team-b'
          'deaths-title-left deaths-title deaths-title-right'
          'deaths-team-a deaths-types deaths-team-b'
          'grenades-title-left grenades-title grenades-title-right'
          'grenades-team-a grenades-types grenades-team-b'
          'damages-title-left damages-title damages-title-right'
          'damages-team-a damages-types damages-team-b'
          'economy-title-left economy-title economy-title-right'
          'economy-team-a economy-types economy-team-b'
        `,
      }}
    >
      {children}
    </div>
  );
}

type GridProps = {
  children: ReactNode;
  area: string;
  playerCount: number;
};

function Grid({ children, area, playerCount }: GridProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${playerCount}, 1fr)`,
        gridArea: area,
      }}
    >
      {children}
    </div>
  );
}

function GridRows({ children }: { children: ReactNode }) {
  return <div className="grid border-r border-r-gray-300 last:border-r-0">{children}</div>;
}

function Middle({ children, area }: { area: string; children: ReactNode }) {
  return (
    <div
      className="flex flex-col items-center justify-center mx-8 h-full"
      style={{
        gridArea: area,
      }}
    >
      {children}
    </div>
  );
}

function StickyHeader({ children, style }: { children?: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="grid sticky -top-16 py-4 bg-gray-75" style={style}>
      {children}
    </div>
  );
}

function Players({ children, playerCount }: { children: ReactNode; playerCount: number }) {
  return (
    <StickyHeader
      style={{
        gridTemplateColumns: `repeat(${playerCount}, 1fr)`,
      }}
    >
      {children}
    </StickyHeader>
  );
}

type TitleProps = {
  children: ReactNode;
};

function Title({ children }: TitleProps) {
  return (
    <div className="flex items-center justify-center w-full h-[50px]">
      <p>{children}</p>
    </div>
  );
}

type PlayerAvatarProps = {
  player: MatchPlayer;
};

function PlayerAvatar({ player }: PlayerAvatarProps) {
  return (
    <div className="flex flex-col items-center">
      <Avatar avatarUrl={player.avatar} size={40} />
      <p className="truncate max-w-[100px] selectable">{player.name}</p>
    </div>
  );
}

type CellProps = {
  value: ReactNode;
};

function Cell({ value }: CellProps) {
  return (
    <div className="flex items-center justify-center bg-gray-100 border-b border-b-gray-300 last:border-b-0">
      <p className="selectable">{value}</p>
    </div>
  );
}

type GameplayProps = {
  roundKills: Kill[];
  playersTeamA: MatchPlayer[];
  playersTeamB: MatchPlayer[];
  round: Round;
};

function Gameplay({ round, roundKills, playersTeamA, playersTeamB }: GameplayProps) {
  const match = useCurrentMatch();
  const renderGameplayGrid = (players: MatchPlayer[], gridArea: string) => {
    return (
      <Grid area={gridArea} playerCount={players.length}>
        {players.map((player) => {
          const playerDeath = roundKills.find((kill) => {
            return kill.victimSteamId === player.steamId;
          });
          const deathTick = playerDeath?.tick ?? round.endOfficiallyTick;
          const timeAlive = roundNumber((deathTick - round.freezetimeEndTick) / match.tickrate);

          return (
            <GridRows key={player.steamId}>
              <Cell value={`${timeAlive}s`} />
            </GridRows>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Middle area="gameplay-title">
        <Title>
          <Trans>Gameplay</Trans>
        </Title>
      </Middle>
      {renderGameplayGrid(playersTeamA, 'gameplay-team-a')}
      <Middle area="gameplay-types">
        <Title>
          <Trans>Time alive</Trans>
        </Title>
      </Middle>
      {renderGameplayGrid(playersTeamB, 'gameplay-team-b')}
    </>
  );
}

type KillsProps = {
  roundKills: Kill[];
  roundChickenDeaths: ChickenDeath[];
  playersTeamA: MatchPlayer[];
  playersTeamB: MatchPlayer[];
};

function Kills({ roundKills, roundChickenDeaths, playersTeamA, playersTeamB }: KillsProps) {
  const renderKillsGrid = (players: MatchPlayer[], gridArea: string) => {
    return (
      <Grid area={gridArea} playerCount={players.length}>
        {players.map((player) => {
          const kills = roundKills.filter((kill) => kill.killerSteamId === player.steamId);
          const airborneKillCount = kills.filter((kill) => kill.isKillerAirborne).length;
          const blindedKillCount = kills.filter((kill) => kill.isKillerBlinded).length;
          const tradeKillCount = kills.filter((kill) => kill.isTradeKill).length;
          const headshotKillCount = kills.filter((kill) => kill.isHeadshot).length;
          const chickenKillCount = roundChickenDeaths.filter((death) => death.killerSteamId === player.steamId).length;

          return (
            <GridRows key={player.steamId}>
              <Cell value={kills.length} />
              <Cell value={headshotKillCount} />
              <Cell value={tradeKillCount} />
              <Cell value={airborneKillCount} />
              <Cell value={blindedKillCount} />
              <Cell value={chickenKillCount} />
            </GridRows>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Middle area="kills-title">
        <Title>
          <Trans>Kills</Trans>
        </Title>
      </Middle>
      {renderKillsGrid(playersTeamA, 'kills-team-a')}
      <Middle area="kills-types">
        <Title>
          <Trans>Kills</Trans>
        </Title>
        <Title>
          <Trans>Headshot kills</Trans>
        </Title>
        <Title>
          <Trans>Trade kills</Trans>
        </Title>
        <Title>
          <Trans>Airborne kills</Trans>
        </Title>
        <Title>
          <Trans>Blinded kills</Trans>
        </Title>
        <Title>
          <Trans>Chicken kills</Trans>
        </Title>
      </Middle>
      {renderKillsGrid(playersTeamB, 'kills-team-b')}
    </>
  );
}

type DeathsProps = {
  roundKills: Kill[];
  playersTeamA: MatchPlayer[];
  playersTeamB: MatchPlayer[];
};

function Deaths({ roundKills, playersTeamA, playersTeamB }: DeathsProps) {
  const renderDeathsGrid = (players: MatchPlayer[], gridArea: string) => {
    return (
      <Grid area={gridArea} playerCount={players.length}>
        {players.map((player) => {
          const deaths = roundKills.filter((kill) => kill.victimSteamId === player.steamId);
          const tradeDeathCount = deaths.filter((kill) => kill.isTradeDeath).length;
          const blindedDeathCount = deaths.filter((kill) => kill.isVictimBlinded).length;

          return (
            <GridRows key={player.steamId}>
              <Cell value={deaths.length} />
              <Cell value={tradeDeathCount} />
              <Cell value={blindedDeathCount} />
            </GridRows>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Middle area="deaths-title">
        <Title>
          <Trans>Deaths</Trans>
        </Title>
      </Middle>
      {renderDeathsGrid(playersTeamA, 'deaths-team-a')}
      <Middle area="deaths-types">
        <Title>
          <Trans>Deaths</Trans>
        </Title>
        <Title>
          <Trans>Trade deaths</Trans>
        </Title>
        <Title>
          <Trans>Blinded deaths</Trans>
        </Title>
      </Middle>
      {renderDeathsGrid(playersTeamB, 'deaths-team-b')}
    </>
  );
}

type GrenadesProps = {
  roundShots: Shot[];
  playersTeamA: MatchPlayer[];
  playersTeamB: MatchPlayer[];
};

function Grenades({ roundShots, playersTeamA, playersTeamB }: GrenadesProps) {
  const renderGrenadesGrid = (players: MatchPlayer[], gridArea: string) => {
    return (
      <Grid area={gridArea} playerCount={players.length}>
        {players.map((player) => {
          const playerShots = roundShots.filter((shot) => {
            return shot.playerSteamId === player.steamId;
          });
          const flashbangCount = playerShots.filter((shot) => shot.weaponName === GrenadeName.Flashbang).length;
          const heCount = playerShots.filter((shot) => shot.weaponName === GrenadeName.HE).length;
          const smokeCount = playerShots.filter((shot) => shot.weaponName === GrenadeName.Smoke).length;
          const decoyCount = playerShots.filter((shot) => shot.weaponName === GrenadeName.Decoy).length;
          const fireGrenadeCount = playerShots.filter((shot) => {
            return shot.weaponName === GrenadeName.Incendiary || shot.weaponName === GrenadeName.Molotov;
          }).length;

          return (
            <GridRows key={player.steamId}>
              <Cell value={flashbangCount} />
              <Cell value={heCount} />
              <Cell value={smokeCount} />
              <Cell value={decoyCount} />
              <Cell value={fireGrenadeCount} />
            </GridRows>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Middle area="grenades-title">
        <Title>
          <Trans>Grenades</Trans>
        </Title>
      </Middle>
      {renderGrenadesGrid(playersTeamA, 'grenades-team-a')}
      <Middle area="grenades-types">
        <Title>
          <Trans>Flash</Trans>
        </Title>
        <Title>
          <Trans>HE</Trans>
        </Title>
        <Title>
          <Trans>Smoke</Trans>
        </Title>
        <Title>
          <Trans>Decoy</Trans>
        </Title>
        <Title>
          <Trans>Molotov</Trans>
        </Title>
      </Middle>
      {renderGrenadesGrid(playersTeamB, 'grenades-team-b')}
    </>
  );
}

type DamagesProps = {
  roundDamages: Damage[];
  roundShots: Shot[];
  playersTeamA: MatchPlayer[];
  playersTeamB: MatchPlayer[];
};

function Damages({ roundShots, roundDamages, playersTeamA, playersTeamB }: DamagesProps) {
  const renderDamagesGrid = (players: MatchPlayer[], gridArea: string) => {
    return (
      <Grid area={gridArea} playerCount={players.length}>
        {players.map((player) => {
          const weaponShotCount = roundShots.filter((shot) => {
            return shot.playerSteamId === player.steamId;
          }).length;

          const playerDamages = roundDamages.filter((damage) => {
            return damage.attackerSteamId === player.steamId;
          });
          const damageDealt = playerDamages.reduce((previousHealthDamage, { healthDamage }) => {
            return previousHealthDamage + healthDamage;
          }, 0);
          const ownDamage = playerDamages
            .filter((damage) => {
              return damage.victimSteamId === player.steamId;
            })
            .reduce((previousHealthDamage, { healthDamage }) => {
              return previousHealthDamage + healthDamage;
            }, 0);
          const ownTeamDamage = playerDamages
            .filter((damage) => {
              return damage.victimTeamName === player.teamName;
            })
            .reduce((previousHealthDamage, { healthDamage }) => {
              return previousHealthDamage + healthDamage;
            }, 0);
          const opponentHurtSteamIds: string[] = [];
          for (const damage of playerDamages) {
            if (
              damage.victimSteamId !== player.steamId &&
              damage.victimTeamName !== player.teamName &&
              !opponentHurtSteamIds.includes(damage.victimSteamId)
            ) {
              opponentHurtSteamIds.push(damage.victimSteamId);
            }
          }

          return (
            <GridRows key={player.steamId}>
              <Cell value={weaponShotCount} />
              <Cell value={damageDealt} />
              <Cell value={opponentHurtSteamIds.length} />
              <Cell value={ownTeamDamage} />
              <Cell value={ownDamage} />
            </GridRows>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Middle area="damages-title">
        <Title>
          <Trans>Damages</Trans>
        </Title>
      </Middle>
      {renderDamagesGrid(playersTeamA, 'damages-team-a')}
      <Middle area="damages-types">
        <Title>
          <Trans>Shots</Trans>
        </Title>
        <Title>
          <Trans>Damage dealt</Trans>
        </Title>
        <Title>
          <Trans>Opponents hurt</Trans>
        </Title>
        <Title>
          <Trans>Own damage</Trans>
        </Title>
        <Title>
          <Trans>Own team damage</Trans>
        </Title>
      </Middle>
      {renderDamagesGrid(playersTeamB, 'damages-team-b')}
    </>
  );
}

type EconomyProps = {
  roundPlayerEconomies: PlayerEconomy[];
  playersTeamA: MatchPlayer[];
  playersTeamB: MatchPlayer[];
};

function Economy({ roundPlayerEconomies, playersTeamA, playersTeamB }: EconomyProps) {
  const formatMoney = useFormatMoney();
  const { translateEconomyType } = useTranslateEconomyType();

  const renderEconomyGrid = (players: MatchPlayer[], gridArea: string) => {
    return (
      <Grid area={gridArea} playerCount={players.length}>
        {players.map((player) => {
          const playerEconomy = roundPlayerEconomies.find((playerEconomy) => {
            return playerEconomy.playerSteamId === player.steamId;
          });
          const equipmentValue = playerEconomy?.equipmentValue || 0;
          const startMoney = playerEconomy?.startMoney || 0;
          const moneySpent = playerEconomy?.moneySpent || 0;
          const economyType = playerEconomy?.type || EconomyType.Eco;

          return (
            <GridRows key={player.steamId}>
              <Cell value={formatMoney(startMoney)} />
              <Cell value={formatMoney(moneySpent)} />
              <Cell value={formatMoney(equipmentValue)} />
              <Cell value={translateEconomyType(economyType)} />
            </GridRows>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Middle area="economy-title">
        <Title>
          <Trans>Economy</Trans>
        </Title>
      </Middle>
      {renderEconomyGrid(playersTeamA, 'economy-team-a')}
      <Middle area="economy-types">
        <Title>
          <Trans>Cash</Trans>
        </Title>
        <Title>
          <Trans>Cash spent</Trans>
        </Title>
        <Title>
          <Trans>Equipment value</Trans>
        </Title>
        <Title>
          <Trans>Strategy</Trans>
        </Title>
      </Middle>
      {renderEconomyGrid(playersTeamB, 'economy-team-b')}
    </>
  );
}

export function PlayersInformation() {
  const match = useCurrentMatch();
  const currentRound = useCurrentRound();
  const playersTeamA = match.players.filter((player) => player.teamName === match.teamA.name);
  const playersTeamB = match.players.filter((player) => player.teamName === match.teamB.name);
  const roundShots = match.shots.filter((shot) => {
    return shot.roundNumber === currentRound.number;
  });
  const roundKills = match.kills.filter((kill) => {
    return kill.roundNumber === currentRound.number;
  });
  const roundDamages = match.damages.filter((damage) => {
    return damage.roundNumber === currentRound.number;
  });
  const roundChickenDeaths = match.chickenDeaths.filter((damage) => {
    return damage.roundNumber === currentRound.number;
  });
  const roundPlayerEconomies = match.playersEconomies.filter((damage) => {
    return damage.roundNumber === currentRound.number;
  });

  return (
    <div className="bg-gray-75 border border-gray-200">
      <div className="p-8">
        <p className="text-body-strong">
          <Trans>Players stats</Trans>
        </p>
      </div>
      <MainGrid>
        <Players playerCount={playersTeamA.length}>
          {playersTeamA.map((player) => {
            return <PlayerAvatar key={player.steamId} player={player} />;
          })}
        </Players>
        <StickyHeader />
        <Players playerCount={playersTeamB.length}>
          {playersTeamB.map((player) => {
            return <PlayerAvatar key={player.steamId} player={player} />;
          })}
        </Players>
        <Gameplay
          roundKills={roundKills}
          playersTeamA={playersTeamA}
          playersTeamB={playersTeamB}
          round={currentRound}
        />
        <Kills
          roundKills={roundKills}
          roundChickenDeaths={roundChickenDeaths}
          playersTeamA={playersTeamA}
          playersTeamB={playersTeamB}
        />
        <Deaths roundKills={roundKills} playersTeamA={playersTeamA} playersTeamB={playersTeamB} />
        <Grenades roundShots={roundShots} playersTeamA={playersTeamA} playersTeamB={playersTeamB} />
        <Damages
          roundShots={roundShots}
          roundDamages={roundDamages}
          playersTeamA={playersTeamA}
          playersTeamB={playersTeamB}
        />
        <Economy roundPlayerEconomies={roundPlayerEconomies} playersTeamA={playersTeamA} playersTeamB={playersTeamB} />
      </MainGrid>
    </div>
  );
}
