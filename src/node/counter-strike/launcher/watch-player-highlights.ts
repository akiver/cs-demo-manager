import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { getPlaybackMatch, type PlaybackMatch } from 'csdm/node/database/watch/get-match-playback';
import { NoKillsFound } from 'csdm/node/counter-strike/launcher/errors/no-kills-found';
import { getSettings } from 'csdm/node/settings/get-settings';
import { WatchType } from 'csdm/common/types/watch-type';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { generatePlayerHighlightsJsonFile } from '../json-actions-file/generate-player-highlights-json-file';
import type { Perspective } from 'csdm/common/types/perspective';
import { watchDemoWithHlae } from './watch-demo-with-hlae';
import { assertPlayersSlotsAreDefined } from './assert-players-slots-are-defined';

type Options = {
  demoPath: string;
  steamId: string;
  perspective: Perspective;
  onGameStart: () => void;
};

function assertPlayerHasActions(match: PlaybackMatch) {
  if (match.actions.length === 0) {
    throw new NoKillsFound();
  }
}

export async function watchPlayerHighlights({ demoPath, steamId, perspective, onGameStart }: Options) {
  const game = await detectDemoGame(demoPath);
  await deleteJsonActionsFile(demoPath);

  const playDemoArgs: string[] = [];
  const settings = await getSettings();
  const { useCustomHighlights, highlights, useHlae, playerVoicesEnabled } = settings.playback;
  const match = await getPlaybackMatch({
    demoPath,
    steamId,
    type: WatchType.Highlights,
    includeDamages: highlights.includeDamages,
  });
  if (game === Game.CSGO) {
    if (useCustomHighlights) {
      if (match === undefined) {
        // Fallback to CSGO built in highlights
        playDemoArgs.push(steamId);
      } else {
        assertPlayerHasActions(match);

        await generatePlayerHighlightsJsonFile({
          actions: match.actions,
          demoPath,
          game,
          tickCount: match.tickCount,
          tickrate: match.tickrate,
          perspective,
          beforeDelaySeconds: highlights.beforeKillDelayInSeconds,
          nextDelaySeconds: highlights.afterKillDelayInSeconds,
          playerVoicesEnabled,
        });
      }
    } else {
      playDemoArgs.push(steamId);
    }
  } else {
    // CS2 built-in highlights is not yet available, so we always use custom highlights
    if (match === undefined) {
      throw new NoKillsFound();
    }

    assertPlayerHasActions(match);
    assertPlayersSlotsAreDefined(match.actions);

    await generatePlayerHighlightsJsonFile({
      actions: match.actions,
      demoPath,
      game,
      tickCount: match.tickCount,
      tickrate: match.tickrate,
      perspective,
      beforeDelaySeconds: highlights.beforeKillDelayInSeconds,
      nextDelaySeconds: highlights.afterKillDelayInSeconds,
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
