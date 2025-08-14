import React, { useEffect } from 'react';
import { WeaponName, type DemoSource } from 'csdm/common/types/counter-strike';
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
  roundTagIdsChanged,
  matchTagIdsChanged,
  victimSelected,
  victimRemoved,
  weaponNamesChanged,
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
import { Trans } from '@lingui/react/macro';
import { TagsFilter } from '../components/dropdown-filter/tags-filter';
import { isCtrlOrCmdEvent } from '../keyboard/keyboard';
import { WeaponsFilter } from '../components/dropdown-filter/weapons-filter';
import { SearchEvent } from 'csdm/common/types/search/search-event';

export function Search() {
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const {
    status,
    event,
    players,
    victims,
    mapNames,
    startDate,
    endDate,
    demoSources,
    roundTagIds,
    matchTagIds,
    weaponNames,
  } = useSearchState();
  const isLoading = status === Status.Loading;
  const isEventWithKills = event.toLowerCase().includes('kill');
  const canFilterOnVictims = isEventWithKills;
  const canFilterOnWeapons = isEventWithKills && event !== SearchEvent.KnifeKills;
  const weapons = [
    WeaponName.Knife,
    WeaponName.Zeus,
    WeaponName.AK47,
    WeaponName.AUG,
    WeaponName.AWP,
    WeaponName.CZ75,
    WeaponName.Deagle,
    WeaponName.DualBerettas,
    WeaponName.Famas,
    WeaponName.FiveSeven,
    WeaponName.G3SG1,
    WeaponName.GalilAR,
    WeaponName.Glock,
    WeaponName.M249,
    WeaponName.M4A1,
    WeaponName.M4A4,
    WeaponName.MAG7,
    WeaponName.MP5,
    WeaponName.MP7,
    WeaponName.Mac10,
    WeaponName.Negev,
    WeaponName.Nova,
    WeaponName.P2000,
    WeaponName.P250,
    WeaponName.P90,
    WeaponName.PPBizon,
    WeaponName.Revolver,
    WeaponName.SG553,
    WeaponName.SawedOff,
    WeaponName.Scar20,
    WeaponName.Scout,
    WeaponName.Tec9,
    WeaponName.UMP45,
    WeaponName.USP,
    WeaponName.XM1014,
    WeaponName.Decoy,
    WeaponName.Flashbang,
    WeaponName.HEGrenade,
    WeaponName.Incendiary,
    WeaponName.Molotov,
    WeaponName.Smoke,
  ];

  const onPlayerSelected = (player: PlayerResult) => {
    dispatch(playerSelected({ player }));
  };

  const onPlayerRemoved = (player: PlayerResult) => {
    dispatch(playerRemoved({ steamId: player.steamId }));
  };

  const onVictimSelected = (victim: PlayerResult) => {
    dispatch(victimSelected({ victim }));
  };

  const onVictimRemoved = (victim: PlayerResult) => {
    dispatch(victimRemoved({ steamId: victim.steamId }));
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

  const onRoundTagIdsChanged = (tagIds: string[]) => {
    dispatch(roundTagIdsChanged({ tagIds }));
  };

  const onMatchTagIdsChanged = (tagIds: string[]) => {
    dispatch(matchTagIdsChanged({ tagIds }));
  };

  const onWeaponNamesChanged = (weaponNames: WeaponName[]) => {
    dispatch(weaponNamesChanged({ weaponNames }));
  };

  const search = async () => {
    try {
      dispatch(searchStart());
      const steamIds = players.map((player) => player.steamId);
      const victimSteamIds = victims.map((victim) => victim.steamId);
      const result = await client.send({
        name: RendererClientMessageName.SearchEvent,
        payload: {
          event,
          steamIds,
          mapNames,
          weaponNames,
          startDate,
          endDate,
          demoSources,
          roundTagIds,
          matchTagIds,
          victimSteamIds,
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isCtrlOrCmdEvent(e)) {
        search();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex gap-x-12 h-full">
        <div className="flex flex-col flex-none pl-16 pr-8 py-16 w-[324px] gap-y-12 overflow-y-auto scrollbar-stable border-r border-gray-200">
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
          {canFilterOnVictims && (
            <div className="flex flex-col gap-y-8">
              <Trans context="Input label">Victims</Trans>
              <SearchPlayersInput
                isDisabled={isLoading}
                selectedPlayers={victims}
                onPlayerSelected={onVictimSelected}
                onPlayerRemoved={onVictimRemoved}
              />
            </div>
          )}
          {canFilterOnWeapons && (
            <WeaponsFilter
              weapons={weapons}
              selectedWeapons={weaponNames}
              hasActiveFilter={weaponNames.length > 0}
              onChange={onWeaponNamesChanged}
            />
          )}
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
            <SourcesFilter
              selectedSources={demoSources}
              onChange={onDemoSourcesChanged}
              hasActiveFilter={demoSources.length > 0}
            />
          </div>
          <div>
            <TagsFilter
              selectedTagIds={matchTagIds}
              onChange={onMatchTagIdsChanged}
              hasActiveFilter={matchTagIds.length > 0}
            />
          </div>
          <div>
            <TagsFilter
              selectedTagIds={roundTagIds}
              onChange={onRoundTagIdsChanged}
              hasActiveFilter={roundTagIds.length > 0}
              title={<Trans context="Round tags filter label">Round tags</Trans>}
            />
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
            <Button variant={ButtonVariant.Primary} onClick={search} isDisabled={isLoading}>
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
