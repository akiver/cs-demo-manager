import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useSearchState } from '../use-search-state';
import { RadioGroupTriState } from 'csdm/ui/components/inputs/radio/radio-group-tri-state';
import {
  collateralKillChanged,
  headshotChanged,
  jumpChanged,
  noScopeChanged,
  teamKillChanged,
  throughSmokeChanged,
  wallbangChanged,
} from '../search-actions';
import { CollapseTransition } from 'csdm/ui/components/transitions/collapse-transition';

type Props = {
  isVisible: boolean;
};

export function KillsFilter({ isVisible }: Props) {
  const dispatch = useDispatch();
  const { headshot, noScope, wallbang, jump, throughSmoke, teamKill, collateralKill } = useSearchState();

  return (
    <div className={isVisible ? '' : '-mb-12'}>
      <CollapseTransition isVisible={isVisible}>
        <div className="flex flex-wrap gap-x-24 gap-y-10 pl-4 *:min-w-[100px]">
          <RadioGroupTriState
            label={<Trans>Headshot</Trans>}
            value={headshot}
            onChange={(headshot) => {
              dispatch(headshotChanged({ headshot }));
            }}
          />
          <RadioGroupTriState
            label={<Trans>No scope</Trans>}
            value={noScope}
            onChange={(noScope) => {
              dispatch(noScopeChanged({ noScope }));
            }}
          />
          <RadioGroupTriState
            label={<Trans>Wallbang</Trans>}
            value={wallbang}
            onChange={(wallbang) => {
              dispatch(wallbangChanged({ wallbang }));
            }}
          />
          <RadioGroupTriState
            label={<Trans>Jump</Trans>}
            value={jump}
            onChange={(jump) => {
              dispatch(jumpChanged({ jump }));
            }}
          />
          <RadioGroupTriState
            label={<Trans>Through smoke</Trans>}
            value={throughSmoke}
            onChange={(throughSmoke) => {
              dispatch(throughSmokeChanged({ throughSmoke }));
            }}
          />
          <RadioGroupTriState
            label={<Trans>Team kill</Trans>}
            value={teamKill}
            onChange={(teamKill) => {
              dispatch(teamKillChanged({ teamKill }));
            }}
          />
          <RadioGroupTriState
            label={<Trans>Collateral</Trans>}
            value={collateralKill}
            onChange={(collateralKill) => {
              dispatch(collateralKillChanged({ collateralKill }));
            }}
          />
        </div>
      </CollapseTransition>
    </div>
  );
}
