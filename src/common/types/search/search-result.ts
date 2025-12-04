import type { MultiKillResult } from './multi-kill-result';
import type { NinjaDefuseResult } from 'csdm/common/types/search/ninja-defuse-result';
import type { ClutchResult } from './clutch-result';
import type { RoundResult } from './round-result';
import type { KillResult } from './kill-result';

export type SearchResult = MultiKillResult[] | ClutchResult[] | NinjaDefuseResult[] | RoundResult[] | KillResult[];
