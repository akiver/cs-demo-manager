import { Game } from 'csdm/common/types/counter-strike';
import { generatePlayerDeathsVdmFile } from 'csdm/node/vdm/generate-player-deaths-vdm-file';
import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { getPlaybackMatch, type PlaybackMatch } from 'csdm/node/database/watch/get-match-playback';
import { NoDeathsFound } from 'csdm/node/counter-strike/launcher/errors/no-deaths-found';
import { getSettings } from 'csdm/node/settings/get-settings';
import type { WatchPlayerOptions } from 'csdm/common/types/watch-player-options';
import { deleteVdmFile } from './delete-vdm-file';
import { WatchType } from 'csdm/common/types/watch-type';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { generatePlayerDeathsJsonFile } from '../json-actions-file/generate-player-deaths-json-file';

function assertPlayerHasDeaths(match: PlaybackMatch, steamId: string) {
  const playerKills = match.kills.filter((kill) => kill.killerSteamId === steamId);
  if (playerKills.length === 0) {
    throw new NoDeathsFound();
  }
}

export async function watchPlayerLowlights({ demoPath, steamId, perspective, onGameStart }: WatchPlayerOptions) {
  const game = await detectDemoGame(demoPath);
  if (game === Game.CSGO) {
    await deleteVdmFile(demoPath);
  } else {
    await deleteJsonActionsFile(demoPath);
  }

  const additionalArguments: string[] = [];
  const settings = await getSettings();
  const { useCustomLowlights, lowlights } = settings.playback;
  const match = await getPlaybackMatch({
    demoPath,
    steamId,
    type: WatchType.Lowlights,
  });
  if (game === Game.CSGO) {
    if (useCustomLowlights) {
      if (match === undefined) {
        // Fallback to CSGO built in lowlights
        additionalArguments.push(steamId, 'lowlights');
      } else {
        assertPlayerHasDeaths(match, steamId);

        await generatePlayerDeathsVdmFile({
          match,
          steamId,
          perspective,
          beforeDelaySeconds: lowlights.beforeKillDelayInSeconds,
          nextDelaySeconds: lowlights.afterKillDelayInSeconds,
        });
      }
    } else {
      additionalArguments.push(steamId, 'lowlights');
    }
  } else {
    // CS2 built-in lowlights is not yet available, so we always use custom lowlights
    if (match === undefined) {
      throw new NoDeathsFound();
    }
    assertPlayerHasDeaths(match, steamId);

    await generatePlayerDeathsJsonFile({
      match,
      perspective,
      beforeDelaySeconds: lowlights.beforeKillDelayInSeconds,
      nextDelaySeconds: lowlights.afterKillDelayInSeconds,
    });
  }

  await startCounterStrike({
    demoPath,
    game,
    additionalArguments,
    onGameStart,
  });
}
