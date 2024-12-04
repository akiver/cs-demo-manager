import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { buildMatchRoundPath, buildMatchRoundsPath } from 'csdm/ui/routes-paths';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { RoundTopBar } from './round-top-bar';
import { KillFeed } from './kill-feed';
import { Clutches } from './clutches';
import { EndReason } from './end-reason';
import { PlayersInformation } from './players-information';
import { Content } from 'csdm/ui/components/content';
import { RoundsNavigationBar } from '../rounds-navigation-bar';
import { PlayersEconomyChart } from './players-economy-chart';
import { RoundTags } from './round-tags';
import { Message } from 'csdm/ui/components/message';
import { Trans } from '@lingui/react/macro';

export function Round() {
  const match = useCurrentMatch();
  const params = useParams<'checksum' | 'number'>();
  const matchChecksum = params.checksum as string;
  const roundNumber = Number.parseInt(params.number as string);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && match.rounds.length > roundNumber) {
        navigate(buildMatchRoundPath(matchChecksum, roundNumber + 1));
      } else if (event.key === 'ArrowLeft') {
        if (roundNumber > 1) {
          navigate(buildMatchRoundPath(matchChecksum, roundNumber - 1));
        } else {
          navigate(buildMatchRoundsPath(matchChecksum));
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  const round = match.rounds.find((round) => round.number === roundNumber);
  if (!round) {
    return <Message message={<Trans>Round number {roundNumber} not found.</Trans>} />;
  }

  return (
    <>
      <RoundTopBar />
      <Content>
        <div className="flex gap-8">
          <KillFeed />
          <Clutches />
          <EndReason />
          <RoundTags />
        </div>
        <div className="mt-12">
          <PlayersEconomyChart />
        </div>
        <div className="mt-12">
          <PlayersInformation />
        </div>
      </Content>
      <RoundsNavigationBar />
    </>
  );
}
