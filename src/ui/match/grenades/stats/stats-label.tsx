import React from 'react';
import { Trans } from '@lingui/react/macro';
import { FlashbangLabels } from 'csdm/ui/match/grenades/stats/labels/flashbang-labels';
import { FireLabels } from 'csdm/ui/match/grenades/stats/labels/fire-labels';
import { HeGrenadeLabels } from 'csdm/ui/match/grenades/stats/labels/he-grenade-labels';
import { GrenadeOption } from 'csdm/ui/match/grenades/stats/grenade-option';
import { StatLabel } from 'csdm/ui/match/grenades/stats/labels/label';

function renderLabelsForGrenade(grenade: GrenadeOption) {
  switch (grenade) {
    case GrenadeOption.Flashbang:
      return <FlashbangLabels />;
    case GrenadeOption.Fire:
      return <FireLabels />;
    case GrenadeOption.HE:
      return <HeGrenadeLabels />;
    case GrenadeOption.Smoke:
      return null;
    default:
      logger.warn(`Unknown grenade type ${grenade}`);
      return null;
  }
}

type Props = {
  grenade: GrenadeOption;
};

export function StatsLabel({ grenade }: Props) {
  return (
    <div className="col-start-2 row-start-2 mx-8 mt-auto">
      <StatLabel text={<Trans>Thrown</Trans>} />
      {renderLabelsForGrenade(grenade)}
    </div>
  );
}
