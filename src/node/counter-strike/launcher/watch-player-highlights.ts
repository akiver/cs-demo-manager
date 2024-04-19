import { Game } from 'csdm/common/types/counter-strike';
import { generatePlayerKillsVdmFile } from 'csdm/node/vdm/generate-player-kills-vdm-file';
import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { getPlaybackMatch, type PlaybackMatch } from 'csdm/node/database/watch/get-match-playback';
import { NoKillsFound } from 'csdm/node/counter-strike/launcher/errors/no-kills-found';
import { getSettings } from 'csdm/node/settings/get-settings';
import { deleteVdmFile } from './delete-vdm-file';
import { WatchType } from 'csdm/common/types/watch-type';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { generatePlayerKillsJsonFile } from '../json-actions-file/generate-player-kills-json-file';
import type { Perspective } from 'csdm/common/types/perspective';

type Options = {
  demoPath: string;
  steamId: string;
  perspective: Perspective;
  onGameStart: () => void;
};

function assertPlayerHasKills(match: PlaybackMatch, steamId: string) {
  const playerKills = match.kills.filter((kill) => kill.killerSteamId === steamId);
  if (playerKills.length === 0) {
    throw new NoKillsFound();
  }
}

export async function watchPlayerHighlights({ demoPath, steamId, perspective, onGameStart }: Options) {
  const game = await detectDemoGame(demoPath);
  if (game === Game.CSGO) {
    await deleteVdmFile(demoPath);
  } else {
    await deleteJsonActionsFile(demoPath);
  }

  const additionalArguments: string[] = [];
  const settings = await getSettings();
  const { useCustomHighlights, highlights } = settings.playback;
  const match = await getPlaybackMatch({
    demoPath,
    steamId,
    type: WatchType.Highlights,
  });
  if (game === Game.CSGO) {
    if (useCustomHighlights) {
      if (match === undefined) {
        // Fallback to CSGO built in highlights
        additionalArguments.push(steamId);
      } else {
        assertPlayerHasKills(match, steamId);

        await generatePlayerKillsVdmFile({
          match,
          steamId,
          perspective,
          beforeDelaySeconds: highlights.beforeKillDelayInSeconds,
          nextDelaySeconds: highlights.afterKillDelayInSeconds,
        });
      }
    } else {
      additionalArguments.push(steamId);
    }
  } else {
    // CS2 built-in highlights is not yet available, so we always use custom highlights
    if (match === undefined) {
      throw new NoKillsFound();
    }
    assertPlayerHasKills(match, steamId);

    await generatePlayerKillsJsonFile({
      match,
      perspective,
      beforeDelaySeconds: highlights.beforeKillDelayInSeconds,
      nextDelaySeconds: highlights.afterKillDelayInSeconds,
    });
  }

  await startCounterStrike({
    demoPath,
    game,
    additionalArguments,
    onGameStart,
  });
}
