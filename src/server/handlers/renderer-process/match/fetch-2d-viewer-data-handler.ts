import { fetchShots } from 'csdm/node/database/shots/fetch-shots';
import { fetchGrenadeTimelines } from 'csdm/node/database/grenade-position/fetch-grenade-timelines';
import type { Round } from 'csdm/common/types/round';
import type { PlayerTimeline } from 'csdm/common/types/player-timeline';
import type { Kill } from 'csdm/common/types/kill';
import { fetchRound } from 'csdm/node/database/rounds/fetch-round';
import { fetchInfernoPositions } from 'csdm/node/database/inferno-position/fetch-inferno-positions';
import type { InfernoPosition } from 'csdm/common/types/inferno-position';
import { fetchPlayersTimelines } from 'csdm/node/database/player-position/fetch-players-timelines';
import type { HostagePosition } from 'csdm/common/types/hostage-position';
import { fetchHostagePositions } from 'csdm/node/database/hostage-position/fetch-hostage-positions';
import type { BombExploded } from 'csdm/common/types/bomb-exploded';
import { fetchBombExploded } from 'csdm/node/database/bomb-exploded/fetch-bomb-exploded';
import type { GrenadeTimeline } from 'csdm/common/types/grenade-timeline';
import type { BombPlanted } from 'csdm/common/types/bomb-planted';
import { fetchBombPlanted } from 'csdm/node/database/bomb-planted/fetch-bomb-planted';
import type { BombDefused } from 'csdm/common/types/bomb-defused';
import { fetchBombDefused } from 'csdm/node/database/bomb-defused/fetch-bomb-defused';
import type { Shot } from 'csdm/common/types/shot';
import type { BombPlantStart } from 'csdm/common/types/bomb-plant-start';
import { fetchBombsPlantStart } from 'csdm/node/database/bomb-plant-start/fetch-bombs-plant-start';
import type { BombDefuseStart } from 'csdm/common/types/bomb-defuse-start';
import { fetchBombsDefuseStart } from 'csdm/node/database/bomb-defuse-start/fetch-bombs-defuse-start';
import type { HostagePickUpStart } from 'csdm/common/types/hostage-pick-up-start';
import { fetchHostagesPickUpStart } from 'csdm/node/database/hostage-pick-up-start/fetch-hostages-pick-up-start';
import { fetchHostagesPickedUp } from 'csdm/node/database/hostage-picked-up/fetch-hostages-picked-up';
import type { HostagePickedUp } from 'csdm/common/types/hostage-picked-up';
import type { ChickenTimeline } from 'csdm/common/types/chicken-timeline';
import { fetchChickenTimelines } from 'csdm/node/database/chicken-position/fetch-chicken-timelines';
import { fetchHeGrenadesExplode } from 'csdm/node/database/he-grenade-exploded/fetch-he-grenades-explode';
import type { HeGrenadeExplode } from 'csdm/common/types/he-grenade-explode';
import type { DecoyStart } from 'csdm/common/types/decoy-start';
import type { SmokeStart } from 'csdm/common/types/smoke-start';
import { fetchDecoysStart } from 'csdm/node/database/decoy-started/fetch-decoys-start';
import { fetchSmokesStart } from 'csdm/node/database/smoke-started/fetch-smokes-start';
import type { FlashbangExplode } from 'csdm/common/types/flashbang-explode';
import { fetchFlashbangsExplode } from 'csdm/node/database/flashbang-exploded/fetch-flashbangs-explode';
import { fetchKills } from 'csdm/node/database/kills/fetch-kills';
import { handleError } from '../../handle-error';
import { getDemoAudioFilePath } from 'csdm/node/demo/get-demo-audio-file-path';

export type Fetch2dViewerDataPayload = {
  checksum: string;
  roundNumber: number;
  demoFilePath: string;
  tickrate: number;
};

export type Fetch2dViewerDataSuccessPayload = {
  playerTimelines: PlayerTimeline[];
  kills: Kill[];
  round: Round | undefined;
  shots: Shot[];
  grenadeTimelines: GrenadeTimeline[];
  infernoPositions: InfernoPosition[];
  hostagesPickUpStart: HostagePickUpStart[];
  hostagesPickedUp: HostagePickedUp[];
  hostagePositions: HostagePosition[];
  bombExploded: BombExploded | null;
  bombPlanted: BombPlanted | null;
  bombDefused: BombDefused | null;
  bombsDefuseStart: BombDefuseStart[];
  bombsPlantStart: BombPlantStart[];
  chickenTimelines: ChickenTimeline[];
  heGrenadesExplode: HeGrenadeExplode[];
  flashbangsExplode: FlashbangExplode[];
  decoysStart: DecoyStart[];
  smokesStart: SmokeStart[];
  audioFilePath: string | null;
};

export async function fetch2DViewerDataHandler({
  checksum,
  roundNumber,
  demoFilePath,
  tickrate,
}: Fetch2dViewerDataPayload) {
  try {
    const [
      playerTimelines,
      round,
      kills,
      shots,
      grenadeTimelines,
      infernoPositions,
      hostagesPickUpStart,
      hostagesPickedUp,
      hostagePositions,
      bombExploded,
      bombPlanted,
      bombDefused,
      bombsPlantStart,
      bombsDefuseStart,
      chickenTimelines,
      heGrenadesExplode,
      decoysStart,
      smokesStart,
      flashbangsExplode,
      audioFilePath,
    ] = await Promise.all([
      fetchPlayersTimelines(checksum, roundNumber, tickrate),
      fetchRound(checksum, roundNumber),
      fetchKills(checksum, roundNumber),
      fetchShots({
        checksum,
        roundNumber,
      }),
      fetchGrenadeTimelines(checksum, roundNumber),
      fetchInfernoPositions(checksum, roundNumber),
      fetchHostagesPickUpStart(checksum, roundNumber),
      fetchHostagesPickedUp(checksum, roundNumber),
      fetchHostagePositions(checksum, roundNumber),
      fetchBombExploded(checksum, roundNumber),
      fetchBombPlanted(checksum, roundNumber),
      fetchBombDefused(checksum, roundNumber),
      fetchBombsPlantStart(checksum, roundNumber),
      fetchBombsDefuseStart(checksum, roundNumber),
      fetchChickenTimelines(checksum, roundNumber),
      fetchHeGrenadesExplode(checksum, roundNumber),
      fetchDecoysStart(checksum, roundNumber),
      fetchSmokesStart(checksum, roundNumber),
      fetchFlashbangsExplode(checksum, roundNumber),
      getDemoAudioFilePath(demoFilePath),
    ]);

    const payload: Fetch2dViewerDataSuccessPayload = {
      round,
      kills,
      shots,
      playerTimelines,
      grenadeTimelines,
      infernoPositions,
      chickenTimelines,
      hostagesPickUpStart,
      hostagesPickedUp,
      hostagePositions,
      bombsPlantStart,
      bombsDefuseStart,
      decoysStart,
      heGrenadesExplode,
      flashbangsExplode,
      smokesStart,
      bombExploded,
      bombPlanted,
      bombDefused,
      audioFilePath,
    };

    return payload;
  } catch (error) {
    handleError(error, 'Error while fetching 2D viewer data');
  }
}
