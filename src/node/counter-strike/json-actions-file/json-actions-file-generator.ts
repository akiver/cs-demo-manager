import fs from 'fs-extra';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';
import { Game } from 'csdm/common/types/counter-strike';

type Action = {
  tick: number;
  cmd: string;
};

// Generates a JSON file that will be read by the game server plugin to execute commands at specific ticks.
// It's like a VDM file.
export class JSONActionsFileGenerator {
  private filePath: string;
  private actions: Action[] = [];
  private game: Game;

  public constructor(demoPath: string, game: Game, playerVoicesEnabled: boolean) {
    this.game = game;
    this.filePath = windowsToUnixPathSeparator(`${demoPath}.json`);

    if (playerVoicesEnabled) {
      this.enablePlayerVoices();
    } else {
      this.disablePlayerVoices();
    }
  }

  public addSkipAhead(startTick: number, toTick: number) {
    this.actions.push({
      cmd: `demo_gototick ${this.getValidTick(toTick)}`,
      tick: this.getValidTick(startTick),
    });

    return this;
  }

  public addSpecPlayer(tick: number, playerId: number | string) {
    const actionTick = this.getValidTick(tick);
    if (this.game === Game.CSGO) {
      // Spectate a player is the combination of spec_lock_to_accountid and spec_player_by_accountid.
      // It prevents to loose focus on the player when an observer was controlling the camera.
      this.actions.push({
        cmd: `spec_lock_to_accountid ${playerId}`,
        tick: actionTick,
      });
      this.actions.push({
        cmd: `spec_player_by_accountid ${playerId}`,
        tick: actionTick,
      });
    } else {
      this.actions.push({
        cmd: `spec_player ${playerId}`,
        tick: actionTick,
      });
      // The camera may be stuck in free mode with some demos (probably related to a server configuration)
      // Force the first person camera mode so the camera will properly focus on the player.
      this.actions.push({
        cmd: 'spec_mode 1',
        tick: actionTick,
      });
    }

    return this;
  }

  public addStopPlayback(tick: number) {
    this.actions.push({
      cmd: 'disconnect',
      tick: this.getValidTick(tick),
    });

    return this;
  }

  // "pause_playback" is a fake command that pause the demo's playback a few seconds from the VSP (CS2 only).
  public addPausePlayback(tick: number) {
    this.actions.push({
      cmd: 'pause_playback',
      tick: this.getValidTick(tick),
    });

    return this;
  }

  public addExecCommand(tick: number, cmd: string) {
    this.actions.push({
      cmd,
      tick: this.getValidTick(tick),
    });

    return this;
  }

  // Adds convars required to hear player voices from both sides.
  public enablePlayerVoices(tick?: number) {
    const actionTick = this.getValidTick(tick ?? 1);
    if (this.game === Game.CSGO) {
      this.actions.push({
        cmd: 'voice_enable 1',
        tick: actionTick,
      });
    } else {
      this.actions.push({
        cmd: 'tv_listen_voice_indices -1',
        tick: actionTick,
      });
      this.actions.push({
        cmd: 'tv_listen_voice_indices_h -1',
        tick: actionTick,
      });
    }

    return this;
  }

  public disablePlayerVoices(tick?: number) {
    const actionTick = this.getValidTick(tick ?? 1);
    if (this.game === Game.CSGO) {
      this.actions.push({
        cmd: 'voice_enable 0',
        tick: actionTick,
      });
    } else {
      this.actions.push({
        cmd: 'tv_listen_voice_indices 0',
        tick: actionTick,
      });
      this.actions.push({
        cmd: 'tv_listen_voice_indices_h 0',
        tick: actionTick,
      });
    }

    return this;
  }

  public async write() {
    if (this.actions.length === 0) {
      return this;
    }

    await fs.writeFile(this.filePath, JSON.stringify(this.actions, null, 2));

    return this;
  }

  private getValidTick(tick: number): number {
    return Math.max(64, tick);
  }
}
