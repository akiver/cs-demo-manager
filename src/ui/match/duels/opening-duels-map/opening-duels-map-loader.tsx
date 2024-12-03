import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Content } from 'csdm/ui/components/content';
import { UnsupportedMap } from 'csdm/ui/components/unsupported-map';
import { Message } from 'csdm/ui/components/message';
import { useCurrentMatchMap } from 'csdm/ui/match/use-current-match-map';
import { useGetMapRadarSrc } from 'csdm/ui/maps/use-get-map-radar-src';
import { useSelectedRadarLevel } from 'csdm/ui/match/grenades/finder/use-selected-radar-level';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { OpeningDuelsMap } from './opening-duels-map';
import type { Kill } from 'csdm/common/types/kill';

export function OpeningDuelsMapLoader() {
  const match = useCurrentMatch();
  const map = useCurrentMatchMap();
  const selectedRadarLevel = useSelectedRadarLevel();
  const getMapRadarFileSrc = useGetMapRadarSrc();

  const radarFileSrc = getMapRadarFileSrc(map?.name, match.game, selectedRadarLevel);
  if (!map || !radarFileSrc) {
    return <UnsupportedMap />;
  }

  const openingKills: Kill[] = [];
  for (const kill of match.kills) {
    if (openingKills.some((k) => k.roundNumber === kill.roundNumber)) {
      continue;
    }

    openingKills.push(kill);
  }

  if (openingKills.length === 0) {
    return <Message message={<Trans>No kills found.</Trans>} />;
  }

  return (
    <Content>
      <OpeningDuelsMap map={map} radarFileSrc={radarFileSrc} kills={openingKills} />
    </Content>
  );
}
