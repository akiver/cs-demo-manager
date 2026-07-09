import React, { useEffect, useState } from 'react';
import { Content } from 'csdm/ui/components/content';
import { MatchActionBar } from './action-bar/action-bar';
import { RoundsTimeline } from './scoreboard/rounds-timeline';
import { Scoreboard } from './scoreboard/scoreboard';
import { MatchInformation } from './scoreboard/match-information';
import { useCurrentMatch } from '../use-current-match';
import { MatchOverviewProvider } from './match-overview-provider';

export function MatchOverview() {
  const match = useCurrentMatch();
  const lastRoundNumber = match.rounds.at(-1)?.number ?? 0;
  const [roundSelection, setRoundSelection] = useState({
    checksum: match.checksum,
    roundNumber: lastRoundNumber,
  });
  const selectedRoundNumber =
    roundSelection.checksum === match.checksum
      ? Math.min(roundSelection.roundNumber, lastRoundNumber)
      : lastRoundNumber;

  useEffect(() => {
    if (roundSelection.checksum !== match.checksum || roundSelection.roundNumber > lastRoundNumber) {
      setRoundSelection({
        checksum: match.checksum,
        roundNumber: lastRoundNumber,
      });
    }
  }, [lastRoundNumber, match.checksum, roundSelection]);

  return (
    <MatchOverviewProvider selectedRoundNumber={selectedRoundNumber}>
      {({ tableTeamA, tableTeamB }) => {
        return (
          <>
            <MatchActionBar />
            <Content>
              <MatchInformation match={match} />
              <div className="flex flex-col">
                <Scoreboard
                  teamName={match.teamA.name}
                  table={tableTeamA}
                  score={match.teamA.score}
                  scoreOppositeTeam={match.teamB.score}
                />
                <RoundsTimeline
                  rounds={match.rounds}
                  selectedRoundNumber={selectedRoundNumber}
                  onSelectRound={(roundNumber) => {
                    setRoundSelection({
                      checksum: match.checksum,
                      roundNumber,
                    });
                  }}
                />
                <Scoreboard
                  teamName={match.teamB.name}
                  table={tableTeamB}
                  score={match.teamB.score}
                  scoreOppositeTeam={match.teamA.score}
                />
              </div>
            </Content>
          </>
        );
      }}
    </MatchOverviewProvider>
  );
}
