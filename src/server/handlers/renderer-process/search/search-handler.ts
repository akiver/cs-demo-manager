import { assertNever } from 'csdm/common/assert-never';
import { SearchEvent } from 'csdm/common/types/search/search-event';
import { searchMultiKills } from 'csdm/node/database/search/search-multi-kills';
import { searchClutches } from 'csdm/node/database/search/search-clutches';
import { searchNinjaDefuse } from 'csdm/node/database/search/search-ninja-defuse';
import type { SearchResult } from 'csdm/common/types/search/search-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import { handleError } from '../../handle-error';
import { searchRounds } from 'csdm/node/database/search/search-rounds';
import { searchKills, type SearchKillsFilter } from 'csdm/node/database/search/search-kills';

export type SearchPayload = Omit<SearchKillsFilter, 'event'> & { event: SearchEvent };

export async function searchHandler(payload: SearchPayload) {
  try {
    let result: SearchResult = [];
    const filter: SearchFilter = {
      steamIds: payload.steamIds,
      victimSteamIds: payload.victimSteamIds,
      mapNames: payload.mapNames,
      weaponNames: payload.weaponNames,
      startDate: payload.startDate,
      endDate: payload.endDate,
      demoSources: payload.demoSources,
      roundTagIds: payload.roundTagIds,
      matchTagIds: payload.matchTagIds,
    };

    switch (payload.event) {
      case SearchEvent.FiveKill:
        result = await searchMultiKills({
          ...filter,
          killCount: 5,
        });
        break;
      case SearchEvent.FourKill:
        result = await searchMultiKills({
          ...filter,
          killCount: 4,
        });
        break;
      case SearchEvent.OneVsFive:
        result = await searchClutches({
          ...filter,
          opponentCount: 5,
        });
        break;
      case SearchEvent.OneVsFour:
        result = await searchClutches({
          ...filter,
          opponentCount: 4,
        });
        break;
      case SearchEvent.OneVsThree:
        result = await searchClutches({
          ...filter,
          opponentCount: 3,
        });
        break;
      case SearchEvent.NinjaDefuse:
        result = await searchNinjaDefuse(filter);
        break;
      case SearchEvent.RoundStart:
        result = await searchRounds(filter);
        break;
      case SearchEvent.Kills:
        result = await searchKills(payload as SearchKillsFilter);
        break;
      default:
        return assertNever(payload.event, `Unsupported search type ${payload.event}`);
    }

    return result;
  } catch (error) {
    handleError(error, 'Error while searching');
  }
}
