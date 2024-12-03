import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { Spinner } from 'csdm/ui/components/spinner';
import { Content, CenteredContent } from 'csdm/ui/components/content';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { GrenadesFinder } from './grenades-finder';
import { useCurrentMatchChecksum } from 'csdm/ui/match/use-current-match-checksum';
import { UnsupportedMap } from 'csdm/ui/components/unsupported-map';
import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';
import { Message } from 'csdm/ui/components/message';
import { useCurrentMatchMap } from 'csdm/ui/match/use-current-match-map';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useGetMapRadarSrc } from 'csdm/ui/maps/use-get-map-radar-src';
import { useSelectedRadarLevel } from './use-selected-radar-level';
import { useCurrentMatch } from '../../use-current-match';

type State = {
  status: Status;
  grenadesThrow: GrenadeThrow[];
};

export function GrenadesFinderLoader() {
  const client = useWebSocketClient();
  const match = useCurrentMatch();
  const map = useCurrentMatchMap();
  const [state, setSate] = useState<State>({
    status: Status.Loading,
    grenadesThrow: [],
  });
  const checksum = useCurrentMatchChecksum();
  const selectedRadarLevel = useSelectedRadarLevel();
  const getMapRadarFileSrc = useGetMapRadarSrc();

  useEffect(() => {
    if (state.status !== Status.Loading) {
      return;
    }

    const fetchGrenades = async () => {
      try {
        const grenadesThrow = await client.send({
          name: RendererClientMessageName.FetchMatchGrenadesThrow,
          payload: checksum,
        });
        setSate({
          status: Status.Success,
          grenadesThrow,
        });
      } catch (error) {
        setSate({
          ...state,
          status: Status.Error,
        });
      }
    };

    fetchGrenades();
  }, [client, state, checksum]);

  const { status, grenadesThrow } = state;

  if (status === Status.Loading) {
    return (
      <CenteredContent>
        <Spinner size={60} />
      </CenteredContent>
    );
  }

  if (status === Status.Error) {
    return <Message message={<Trans>An error occurred.</Trans>} />;
  }

  const radarFileSrc = getMapRadarFileSrc(map?.name, match.game, selectedRadarLevel);
  if (map === undefined || radarFileSrc === undefined) {
    return <UnsupportedMap />;
  }

  if (grenadesThrow.length === 0) {
    return <Message message={<Trans>No grenades found.</Trans>} />;
  }

  return (
    <Content>
      <GrenadesFinder map={map} grenadesThrow={grenadesThrow} radarFileSrc={radarFileSrc} />
    </Content>
  );
}
