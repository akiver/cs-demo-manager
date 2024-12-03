import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DemoSource, Game } from 'csdm/common/types/counter-strike';
import { CenteredContent } from 'csdm/ui/components/content';
import { useCurrentMatch } from '../use-current-match';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';

export function EmptyChatMessages() {
  const match = useCurrentMatch();
  const formatDate = useFormatDate();

  const renderValveNotice = () => {
    if (match.game === Game.CSGO) {
      return (
        <p>
          <Trans>
            Chat messages are available only if the <code>.info</code> file of the demo is next to its <code>.dem</code>{' '}
            file during analysis.
          </Trans>
        </p>
      );
    }

    const updateDate = formatDate('2024-05-29', {
      hour: undefined,
      minute: undefined,
      second: undefined,
    });

    return (
      <p>
        <Trans>Chat messages are available with Valve demos only after the {updateDate} CS2 update.</Trans>
      </p>
    );
  };

  return (
    <CenteredContent>
      <p className="text-subtitle">
        <Trans>No chat messages found.</Trans>
      </p>
      {match.source === DemoSource.Valve && renderValveNotice()}
    </CenteredContent>
  );
}
