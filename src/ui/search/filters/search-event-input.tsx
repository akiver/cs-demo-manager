import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { SearchEvent } from 'csdm/common/types/search/search-event';
import { Status } from 'csdm/common/types/status';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useSearchState } from '../use-search-state';
import { searchEventChanged } from '../search-actions';

function useSearchEventOptions(): SelectOption<SearchEvent>[] {
  const { t } = useLingui();

  return [
    {
      label: t({
        message: 'Kills',
        context: 'Select option label',
      }),
      value: SearchEvent.Kills,
    },
    {
      label: t({
        message: '5 kills',
        context: 'Select option label',
      }),
      value: SearchEvent.FiveKill,
    },
    {
      label: t({
        message: '4 kills',
        context: 'Select option label',
      }),
      value: SearchEvent.FourKill,
    },
    {
      label: t({
        message: '1 versus 5',
        context: 'Select option label',
      }),
      value: SearchEvent.OneVsFive,
    },
    {
      label: t({
        message: '1 versus 4',
        context: 'Select option label',
      }),
      value: SearchEvent.OneVsFour,
    },
    {
      label: t({
        message: '1 versus 3',
        context: 'Select option label',
      }),
      value: SearchEvent.OneVsThree,
    },
    {
      label: t({
        message: 'Ninja defuse',
        context: 'Select option label',
      }),
      value: SearchEvent.NinjaDefuse,
    },
    {
      label: t({
        message: 'Round start',
        context: 'Select option label',
      }),
      value: SearchEvent.RoundStart,
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
