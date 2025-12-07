import type { Settings } from 'csdm/node/settings/settings';
import type { Analysis } from 'csdm/common/types/analysis';
import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import { fetchMaps } from 'csdm/node/database/maps/fetch-maps';
import type { Map } from 'csdm/common/types/map';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import type { Tag } from 'csdm/common/types/tag';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { analysesListener } from 'csdm/server/analyses-listener';
import { fetchTags } from 'csdm/node/database/tags/fetch-tags';
import { fetchFaceitAccounts } from 'csdm/node/database/faceit-account/fetch-faceit-accounts';
import type { Download } from 'csdm/common/download/download-types';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';
import { fetchIgnoredSteamAccounts } from 'csdm/node/database/steam-accounts/fetch-ignored-steam-accounts';
import type { IgnoredSteamAccount } from 'csdm/common/types/ignored-steam-account';
import { initializeSettings } from 'csdm/node/settings/initialize-settings';
import { videoQueue } from 'csdm/server/video-queue';
import { type Video } from 'csdm/common/types/video';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';
import { fetch5EPlayAccounts } from 'csdm/node/database/5play-account/fetch-5eplay-accounts';
import type { Camera } from 'csdm/common/types/camera';
import { fetchCameras } from 'csdm/node/database/cameras/fetch-cameras';
import type { RenownAccount } from 'csdm/common/types/renown-account';
import { fetchRenownAccounts } from 'csdm/node/database/renown-account/fetch-renown-accounts';

export type InitializeApplicationSuccessPayload = {
  matchChecksums: string[];
  maps: Map[];
  cameras: Camera[];
  analyses: Analysis[];
  tags: Tag[];
  settings: Settings;
  faceitAccounts: FaceitAccount[];
  fiveEPlayAccounts: FiveEPlayAccount[];
  renownAccounts: RenownAccount[];
  downloads: Download[];
  ignoredSteamAccounts: IgnoredSteamAccount[];
  videos: Video[];
};

export async function initializeApplicationHandler() {
  try {
    const [
      settings,
      maps,
      cameras,
      tags,
      matchChecksums,
      faceitAccounts,
      fiveEPlayAccounts,
      renownAccounts,
      ignoredSteamAccounts,
    ] = await Promise.all([
      initializeSettings(),
      fetchMaps(),
      fetchCameras(),
      fetchTags(),
      fetchMatchChecksums(),
      fetchFaceitAccounts(),
      fetch5EPlayAccounts(),
      fetchRenownAccounts(),
      fetchIgnoredSteamAccounts(),
    ]);
    const payload: InitializeApplicationSuccessPayload = {
      maps,
      cameras,
      tags,
      matchChecksums,
      settings,
      faceitAccounts,
      fiveEPlayAccounts,
      renownAccounts,
      ignoredSteamAccounts,
      analyses: analysesListener.getAnalyses(),
      downloads: downloadDemoQueue.getDownloads(),
      videos: videoQueue.getVideos(),
    };

    startBackgroundTasks();

    return payload;
  } catch (error) {
    logger.error('App initialization error');
    logger.error(error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw errorMessage;
  }
}
