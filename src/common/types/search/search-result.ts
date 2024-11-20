import type { MultiKillResult } from './multi-kill-result';
import type { WallbangKillResult } from 'csdm/common/types/search/wallbang-kill-result';
import type { CollateralKillResult } from 'csdm/common/types/search/collateral-kill-result';
import type { NinjaDefuseResult } from 'csdm/common/types/search/ninja-defuse-result';
import type { ClutchResult } from './clutch-result';
import type { RoundResult } from './round-result';

export type SearchResult =
  | MultiKillResult[]
  | ClutchResult[]
  | WallbangKillResult[]
  | CollateralKillResult[]
  | NinjaDefuseResult[]
  | RoundResult[];
