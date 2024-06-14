import { Game } from 'csdm/common/types/counter-strike';
import { generatePlayerLowlightsVdmFile } from 'csdm/node/vdm/generate-player-lowlights-vdm-file';
import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { getPlaybackMatch, type PlaybackMatch } from 'csdm/node/database/watch/get-match-playback';
import { NoDeathsFound } from 'csdm/node/counter-strike/launcher/errors/no-deaths-found';
import { getSettings } from 'csdm/node/settings/get-settings';
import type { WatchPlayerOptions } from 'csdm/common/types/watch-player-options';
import { deleteVdmFile } from './delete-vdm-file';
import { WatchType } from 'csdm/common/types/watch-type';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { generatePlayerLowlightsJsonFile } from '../json-actions-file/generate-player-lowlights-json-file';
import { watchDemoWithHlae } from './watch-demo-with-hlae';
import { assertPlayersSlotsAreDefined } from './assert-players-slots-are-defined';

function assertPlayerHasActions(match: PlaybackMatch) {
  if (match.actions.length === 0) {
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

  const playDemoArgs: string[] = [];
  const settings = await getSettings();
  const { useCustomLowlights, lowlights, useHlae, playerVoicesEnabled } = settings.playback;
  const match = await getPlaybackMatch({
    demoPath,
    steamId,
    type: WatchType.Lowlights,
    includeDamages: lowlights.includeDamages,
  });
  if (game === Game.CSGO) {
    if (useCustomLowlights) {
      if (match === undefined) {
        // Fallback to CSGO built in lowlights
        playDemoArgs.push(steamId, 'lowlights');
      } else {
        assertPlayerHasActions(match);

        await generatePlayerLowlightsVdmFile({
          actions: match.actions,
          demoPath,
          tickCount: match.tickCount,
          tickrate: match.tickrate,
          perspective,
          beforeDelaySeconds: lowlights.beforeKillDelayInSeconds,
          nextDelaySeconds: lowlights.afterKillDelayInSeconds,
        });
      }
    } else {
      playDemoArgs.push(steamId, 'lowlights');
    }
  } else {
    // CS2 built-in lowlights is not yet available, so we always use custom lowlights
    if (match === undefined) {
      throw new NoDeathsFound();
    }

    assertPlayerHasActions(match);
    assertPlayersSlotsAreDefined(match.actions);

    await generatePlayerLowlightsJsonFile({
      actions: match.actions,
      demoPath,
      tickCount: match.tickCount,
      tickrate: match.tickrate,
      perspective,
      beforeDelaySeconds: lowlights.beforeKillDelayInSeconds,
      nextDelaySeconds: lowlights.afterKillDelayInSeconds,
      playerVoicesEnabled,
    });
  }

  if (useHlae) {
    await watchDemoWithHlae({
      demoPath,
      game,
      playDemoArgs,
      onGameStart,
    });
  } else {
    await startCounterStrike({
      demoPath,
      game,
      playDemoArgs,
      onGameStart,
    });
  }
}
