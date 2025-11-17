import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useIsCsRunning } from './use-is-cs-running';
import type { WatchDemoPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-demo-handler';
import { Game } from 'csdm/common/types/counter-strike';
import type { WatchPlayerLowlightsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-lowlights-handler';
import type { WatchPlayerHighlightsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-highlights-handler';
import type { WatchPlayerAsSuspectPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-as-suspect-handler';
import type { WatchPlayerRoundsPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-player-rounds-handler';
import type { StartCounterStrikePayload } from 'csdm/server/handlers/renderer-process/counter-strike/start-counter-strike-handler';

export function isCounterStrikeStartable(game: Game) {
  if (window.csdm.isMac) {
    return game === Game.CSGO;
  }

  return true;
}

export function isVideoGenerationAvailable(game: Game) {
  if (game === Game.CSGO) {
    return true;
  }

  return !window.csdm.isMac;
}

export function useCounterStrike() {
  const client = useWebSocketClient();
  const isCsRunning = useIsCsRunning();

  const isKillCsRequired = async () => {
    const csRunning = await isCsRunning();
    if (csRunning) {
      const isCs2Connected = await client.send({
        name: RendererClientMessageName.IsCs2ConnectedToServer,
      });

      return !isCs2Connected;
    }

    return false;
  };

  const startGame = async (options: StartCounterStrikePayload) => {
    await client.send({
      name: RendererClientMessageName.StartCounterStrike,
      payload: options,
    });
  };

  const watchDemo = async (options: WatchDemoPayload) => {
    await client.send({
      name: RendererClientMessageName.WatchDemo,
      payload: options,
    });
  };

  const watchPlayerLowlights = async (options: WatchPlayerLowlightsPayload) => {
    await client.send({
      name: RendererClientMessageName.WatchPlayerLowlights,
      payload: options,
    });
  };

  const watchPlayerHighlights = async (options: WatchPlayerHighlightsPayload) => {
    await client.send({
      name: RendererClientMessageName.WatchPlayerHighlights,
      payload: options,
    });
  };

  const watchPlayerAsSuspect = async (options: WatchPlayerAsSuspectPayload) => {
    await client.send({
      name: RendererClientMessageName.WatchPlayerAsSuspect,
      payload: options,
    });
  };

  const watchPlayerRounds = async (options: WatchPlayerRoundsPayload) => {
    await client.send({
      name: RendererClientMessageName.WatchPlayerRounds,
      payload: options,
    });
  };

  return {
    startGame,
    watchDemo,
    watchPlayerRounds,
    watchPlayerLowlights,
    watchPlayerHighlights,
    watchPlayerAsSuspect,
    isKillCsRequired,
    isCsRunning,
  };
}
