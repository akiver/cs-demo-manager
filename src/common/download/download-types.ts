import type { Game } from 'csdm/common/types/counter-strike';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import type { ValveMatch } from 'csdm/common/types/valve-match';
import type { FiveEPlayMatch } from '../types/5eplay-match';

export const DownloadSource = {
  Valve: 'valve',
  Faceit: 'faceit',
  '5EPlay': '5eplay',
} as const;
export type DownloadSource = (typeof DownloadSource)[keyof typeof DownloadSource];

export type DownloadDemoProgressPayload = {
  matchId: string;
  progress: number;
};

export type DownloadDemoSuccess = {
  download: Download;
  demoChecksum: string;
};

type BaseDownload = {
  game: Game;
  matchId: string;
  fileName: string;
  demoUrl: string;
};

export type ValveDownload = BaseDownload & {
  source: typeof DownloadSource.Valve;
  match: ValveMatch;
};

export type FaceitDownload = BaseDownload & {
  source: typeof DownloadSource.Faceit;
  match: FaceitMatch;
};

export type FiveEPlayDownload = BaseDownload & {
  source: (typeof DownloadSource)['5EPlay'];
  match: FiveEPlayMatch;
};

export type Download = ValveDownload | FaceitDownload | FiveEPlayDownload;
