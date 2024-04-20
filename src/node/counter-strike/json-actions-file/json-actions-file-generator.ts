import fs from 'fs-extra';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';

type Action = {
  tick: number;
  cmd: string;
};

// Generates a JSON file that will be read by the CS2 server plugin to execute commands at specific ticks.
// It's like a VDM file.
export class JSONActionsFileGenerator {
  private filePath: string;
  private actions: Action[] = [];

  public constructor(demoPath: string) {
    this.filePath = windowsToUnixPathSeparator(`${demoPath}.json`);
  }

  public addSkipAhead(startTick: number, toTick: number) {
    this.actions.push({
      cmd: `demo_gototick ${this.getValidTick(toTick)}`,
      tick: this.getValidTick(startTick),
    });

    return this;
  }

  public addSpecPlayer(tick: number, steamId: string) {
    this.actions.push({
      cmd: `spec_lock_to_accountid ${steamId}`,
      tick: this.getValidTick(tick),
    });
    // The camera may be stuck in free mode with some demos (probably related to a server configuration)
    // Force the first person camera mode so the camera will properly focus on the player.
    this.actions.push({
      cmd: 'spec_mode 1',
      tick: this.getValidTick(tick),
    });

    return this;
  }

  public addStopPlayback(tick: number) {
    this.actions.push({
      cmd: 'disconnect',
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
