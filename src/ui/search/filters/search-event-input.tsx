import React from 'react';
import { msg } from '@lingui/macro';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { SearchEvent } from 'csdm/common/types/search/search-event';
import { Status } from 'csdm/common/types/status';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useSearchState } from '../use-search-state';
import { searchEventChanged } from '../search-actions';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

function useSearchEventOptions(): SelectOption<SearchEvent>[] {
  const _ = useI18n();

  return [
    {
      label: _(
        msg({
          message: '5 kills',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.FiveKill,
    },
    {
      label: _(
        msg({
          message: '4 kills',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.FourKill,
    },
    {
      label: _(
        msg({
          message: '1 versus 5',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.OneVsFive,
    },
    {
      label: _(
        msg({
          message: '1 versus 4',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.OneVsFour,
    },
    {
      label: _(
        msg({
          message: '1 versus 3',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.OneVsThree,
    },
    {
      label: _(
        msg({
          message: 'Wallbang kills',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.WallbangKills,
    },
    {
      label: _(
        msg({
          message: 'Collateral kills',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.CollateralKills,
    },
    {
      label: _(
        msg({
          message: 'Knife/Tazer kills',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.KnifeKills,
    },
    {
      label: _(
        msg({
          message: 'Jump kills',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.JumpKills,
    },
    {
      label: _(
        msg({
          message: 'Team kills',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.TeamKills,
    },
    {
      label: _(
        msg({
          message: 'Ninja defuse',
          context: 'Select option label',
        }),
      ),
      value: SearchEvent.NinjaDefuse,
    },
  ];
}

export function SearchEventInput() {
  const dispatch = useDispatch();
  const options = useSearchEventOptions();
  const { status, event } = useSearchState();
  const isLoading = status === Status.Loading;

  const onChange = (event: SearchEvent) => {
    dispatch(searchEventChanged({ event }));
  };

  return <Select<SearchEvent> options={options} onChange={onChange} value={event} isDisabled={isLoading} />;
}
