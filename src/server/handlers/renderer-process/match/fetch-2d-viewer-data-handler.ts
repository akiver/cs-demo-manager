import { fetchShots } from 'csdm/node/database/shots/fetch-shots';
import { fetchGrenadePositions } from 'csdm/node/database/grenade-position/fetch-grenade-positions';
import type { Round } from 'csdm/common/types/round';
import type { PlayerPosition } from 'csdm/common/types/player-position';
import type { Kill } from 'csdm/common/types/kill';
import { fetchRound } from 'csdm/node/database/rounds/fetch-round';
import { fetchInfernoPositions } from 'csdm/node/database/inferno-position/fetch-inferno-positions';
import type { InfernoPosition } from 'csdm/common/types/inferno-position';
import { fetchPlayersPositions } from 'csdm/node/database/player-position/fetch-players-positions';
import type { HostagePosition } from 'csdm/common/types/hostage-position';
import { fetchHostagePositions } from 'csdm/node/database/hostage-position/fetch-hostage-positions';
import type { BombExploded } from 'csdm/common/types/bomb-exploded';
import { fetchBombExploded } from 'csdm/node/database/bomb-exploded/fetch-bomb-exploded';
import type { GrenadePosition } from 'csdm/common/types/grenade-position';
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
import type { ChickenPosition } from 'csdm/common/types/chicken-position';
import { fetchChickenPositions } from 'csdm/node/database/chicken-position/fetch-chicken-positions';
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
};

export type Fetch2dViewerDataSuccessPayload = {
  playerPositions: PlayerPosition[];
  kills: Kill[];
  round: Round | undefined;
  shots: Shot[];
  grenadePositions: GrenadePosition[];
  infernoPositions: InfernoPosition[];
  hostagesPickUpStart: HostagePickUpStart[];
  hostagesPickedUp: HostagePickedUp[];
  hostagePositions: HostagePosition[];
  bombExploded: BombExploded | null;
  bombPlanted: BombPlanted | null;
  bombDefused: BombDefused | null;
  bombsDefuseStart: BombDefuseStart[];
  bombsPlantStart: BombPlantStart[];
  chickenPositions: ChickenPosition[];
  heGrenadesExplode: HeGrenadeExplode[];
  flashbangsExplode: FlashbangExplode[];
  decoysStart: DecoyStart[];
  smokesStart: SmokeStart[];
  audioFilePath: string | null;
};

export async function fetch2DViewerDataHandler({ checksum, roundNumber, demoFilePath }: Fetch2dViewerDataPayload) {
  try {
    const [
      playerPositions,
      round,
      kills,
      shots,
      grenadePositions,
      infernoPositions,
      hostagesPickUpStart,
      hostagesPickedUp,
      hostagePositions,
      bombExploded,
      bombPlanted,
      bombDefused,
      bombsPlantStart,
      bombsDefuseStart,
      chickenPositions,
      heGrenadesExplode,
      decoysStart,
      smokesStart,
      flashbangsExplode,
      audioFilePath,
    ] = await Promise.all([
      fetchPlayersPositions(checksum, roundNumber),
      fetchRound(checksum, roundNumber),
      fetchKills(checksum, roundNumber),
      fetchShots({
        checksum,
        roundNumber,
      }),
      fetchGrenadePositions(checksum, roundNumber),
      fetchInfernoPositions(checksum, roundNumber),
      fetchHostagesPickUpStart(checksum, roundNumber),
      fetchHostagesPickedUp(checksum, roundNumber),
      fetchHostagePositions(checksum, roundNumber),
      fetchBombExploded(checksum, roundNumber),
      fetchBombPlanted(checksum, roundNumber),
      fetchBombDefused(checksum, roundNumber),
      fetchBombsPlantStart(checksum, roundNumber),
      fetchBombsDefuseStart(checksum, roundNumber),
      fetchChickenPositions(checksum, roundNumber),
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
      playerPositions,
      grenadePositions,
      infernoPositions,
      chickenPositions,
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
