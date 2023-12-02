import fs from 'fs-extra';
import { main } from 'csdm/node/vdm/templates/main';
import { skipAhead } from 'csdm/node/vdm/templates/skip-ahead';
import { specLock } from 'csdm/node/vdm/templates/spec-lock';
import { stopPlayback } from 'csdm/node/vdm/templates/stop-playback';
import { screenFade } from 'csdm/node/vdm/templates/screen-fade';
import { textMessage } from 'csdm/node/vdm/templates/text-message';
import { specPlayer } from 'csdm/node/vdm/templates/spec-player';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';
import { execCommands } from './templates/exec-commands';

export class VDMGenerator {
  private filePath: string;
  private actionCount = 1;
  private content = '';

  public constructor(demoPath: string) {
    this.filePath = windowsToUnixPathSeparator(`${demoPath.slice(0, -3)}vdm`);
  }

  /** @public Used for test */
  public getVdmPath() {
    return this.filePath;
  }

  public addSkipAhead(startTick: number, toTick: number) {
    this.content += skipAhead(this.actionCount++, startTick, toTick);

    return this;
  }

  public addSpecPlayer(tick: number, steamId: string) {
    // Spectate a player is the combination of spec_lock_to_accountid and spec_player_by_accountid.
    // It prevents to loose focus on the player when an observer was controlling the camera.
    this.content += specLock(this.actionCount++, tick, steamId);
    this.content += specPlayer(this.actionCount++, tick, steamId);

    return this;
  }

  public addStopPlayback(tick: number) {
    this.content += stopPlayback(this.actionCount++, tick);

    return this;
  }

  public addScreenFade(tick: number) {
    this.content += screenFade(this.actionCount++, tick);

    return this;
  }

  public addTextMessage(tick: number, message: string) {
    this.content += textMessage(this.actionCount++, tick, message);

    return this;
  }

  public addExecCommands(tick: number, commands: string) {
    this.content += execCommands(this.actionCount++, tick, commands);

    return this;
  }

  public async write() {
    if (this.content === '') {
      return this;
    }

    this.content = main(this.content);
    await fs.writeFile(this.filePath, this.content);

    return this;
  }
}
