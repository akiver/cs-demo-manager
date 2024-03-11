import React from 'react';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import {
  periodChanged,
  mapRemoved,
  mapSelected,
  playerRemoved,
  playerSelected,
  searchError,
  searchStart,
  searchSuccess,
  demoSourcesChanged,
} from './search-actions';
import { useSearchState } from './use-search-state';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { ErrorCode } from 'csdm/common/error-code';
import { SearchPlayersInput } from './filters/search-players-input';
import { SearchResults } from './search-results';
import { Status } from 'csdm/common/types/status';
import { SearchEventInput } from './filters/search-event-input';
import { SearchMapsInput } from './filters/search-maps-input';
import { PeriodFilter } from 'csdm/ui/components/dropdown-filter/period-filter';
import { formatDate, type DateRange } from 'csdm/common/date/date-range';
import { SourcesFilter } from 'csdm/ui/components/dropdown-filter/sources-filter';
import type { PlayerResult } from 'csdm/common/types/search/player-result';
import { Trans } from '@lingui/macro';

export function Search() {
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const { status, event, players, mapNames, startDate, endDate, demoSources } = useSearchState();
  const isLoading = status === Status.Loading;

  const onPlayerSelected = (player: PlayerResult) => {
    dispatch(playerSelected({ player }));
  };

  const onPlayerRemoved = (player: PlayerResult) => {
    dispatch(playerRemoved({ steamId: player.steamId }));
  };

  const onMapSelected = (mapName: string) => {
    dispatch(mapSelected({ mapName }));
  };

  const onMapRemoved = (mapName: string) => {
    dispatch(mapRemoved({ mapName }));
  };

  const onDemoSourcesChanged = (demoSources: DemoSource[]) => {
    dispatch(demoSourcesChanged({ demoSources }));
  };

  const onSearchClick = async () => {
    try {
      dispatch(searchStart());
      const steamIds = players.map((player) => player.steamId);
      const result = await client.send({
        name: RendererClientMessageName.SearchEvent,
        payload: {
          event,
          steamIds,
          mapNames,
          startDate,
          endDate,
          demoSources,
        },
      });

      dispatch(searchSuccess({ result }));
    } catch (errorCode) {
      dispatch(searchError({ errorCode: errorCode as ErrorCode }));
    }
  };

  const onPeriodChange = (range: DateRange | undefined) => {
    const startDate = formatDate(range?.from);
    const endDate = formatDate(range?.to);
    dispatch(periodChanged({ startDate, endDate }));
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex gap-x-12 h-full">
        <div className="flex flex-col flex-none pl-16 pr-8 py-16 w-[324px] gap-y-12 overflow-y-auto scrollbar-stable border-r">
          <div className="flex flex-col gap-y-8">
            <Trans context="Input label">Event</Trans>
            <SearchEventInput />
          </div>
          <div className="flex flex-col gap-y-8">
            <Trans context="Input label">Players</Trans>
            <SearchPlayersInput
              isDisabled={isLoading}
              selectedPlayers={players}
              onPlayerSelected={onPlayerSelected}
              onPlayerRemoved={onPlayerRemoved}
            />
          </div>
          <div className="flex flex-col gap-y-8">
            <Trans context="Input label">Maps</Trans>
            <SearchMapsInput
              isDisabled={isLoading}
              selectedMaps={mapNames}
              onMapSelected={onMapSelected}
              onMapRemoved={onMapRemoved}
            />
          </div>
          <div>
            <SourcesFilter selectedSources={demoSources} onChange={onDemoSourcesChanged} />
          </div>
          <div className="flex flex-col gap-y-8">
            <p>
              <Trans context="Input label">Period</Trans>
            </p>
            <PeriodFilter
              isDisabled={isLoading}
              startDate={startDate}
              endDate={endDate}
              onRangeChange={onPeriodChange}
              showFilterIndicator={false}
            />
          </div>
          <div>
            <Button variant={ButtonVariant.Primary} onClick={onSearchClick} isDisabled={isLoading}>
              <Trans context="Button">Search</Trans>
            </Button>
          </div>
        </div>
        <div className="w-full py-16 pr-16">
          <SearchResults />
        </div>
      </div>
    </div>
  );
}
