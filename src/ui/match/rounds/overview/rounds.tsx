import React, { useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { useNavigate, useParams } from 'react-router';
import { buildMatchRoundPath } from 'csdm/ui/routes-paths';
import { Content } from 'csdm/ui/components/content';
import { useCurrentMatch } from '../../use-current-match';
import { RoundsNavigationBar } from '../rounds-navigation-bar';
import { RoundsEntries } from './rounds-entries';
import { RoundsHistory } from './rounds-history';
import { Message } from 'csdm/ui/components/message';

export function Rounds() {
  const match = useCurrentMatch();
  const { checksum } = useParams<'checksum'>();
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { rounds } = match;
      if (event.key === 'ArrowRight' && rounds.length > 1) {
        navigate(buildMatchRoundPath(checksum as string, 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  if (match.rounds.length === 0) {
    return <Message message={<Trans>No rounds found.</Trans>} />;
  }

  return (
    <>
      <Content>
        <RoundsHistory />
        <RoundsEntries />
      </Content>
      <RoundsNavigationBar />
    </>
  );
}
