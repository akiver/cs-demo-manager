import { assertNever } from 'csdm/common/assert-never';
import { SearchEvent } from 'csdm/common/types/search/search-event';
import { searchMultiKills } from 'csdm/node/database/search/search-multi-kills';
import { searchClutches } from 'csdm/node/database/search/search-clutches';
import { searchWallbangKills } from 'csdm/node/database/search/search-wallbang-kills';
import { searchCollateralKills } from 'csdm/node/database/search/search-collateral-kills';
import { searchKnifeKills } from 'csdm/node/database/search/search-knife-kills';
import { searchNinjaDefuse } from 'csdm/node/database/search/search-ninja-defuse';
import type { SearchResult } from 'csdm/common/types/search/search-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import { handleError } from '../../handle-error';
import { searchJumpKills } from 'csdm/node/database/search/search-jump-kills';
import { searchTeamKills } from 'csdm/node/database/search/search-team-kills';

export type SearchPayload = SearchFilter & {
  event: SearchEvent;
};

export async function searchHandler(payload: SearchPayload) {
  try {
    let result: SearchResult = [];
    const filter: SearchFilter = {
      steamIds: payload.steamIds,
      mapNames: payload.mapNames,
      startDate: payload.startDate,
      endDate: payload.endDate,
      demoSources: payload.demoSources,
      roundTagIds: payload.roundTagIds,
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
      case SearchEvent.WallbangKills:
        result = await searchWallbangKills(filter);
        break;
      case SearchEvent.CollateralKills:
        result = await searchCollateralKills(filter);
        break;
      case SearchEvent.KnifeKills:
        result = await searchKnifeKills(filter);
        break;
      case SearchEvent.NinjaDefuse:
        result = await searchNinjaDefuse(filter);
        break;
      case SearchEvent.JumpKills:
        result = await searchJumpKills(filter);
        break;
      case SearchEvent.TeamKills:
        result = await searchTeamKills(filter);
        break;
      default:
        return assertNever(payload.event, `Unsupported search type ${payload.event}}`);
    }

    return result;
  } catch (error) {
    handleError(error, 'Error while searching');
  }
}
