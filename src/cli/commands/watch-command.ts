import path from 'node:path';
import { Command } from './command';
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import type { WatchDemoPayload } from 'csdm/server/handlers/renderer-process/counter-strike/watch-demo-handler';
import type { TickCommand } from 'csdm/node/counter-strike/launcher/watch-demo';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { CommandError } from 'csdm/cli/errors/command-error';
import { output } from 'csdm/cli/output';
import type { CommandOptions } from 'csdm/cli/parse-command-args';

export class WatchCommand extends Command {
  public static Name = 'watch';
  public static Description = 'Start the playback of a demo in Counter-Strike.';
  private readonly options = {
    tick: {
      type: 'string',
      valueName: 'number',
      description: 'Tick at which the playback starts.',
    },
    'focus-player': {
      type: 'string',
      valueName: 'steamId',
      description: 'Steam ID of the player to focus the camera on, the demo must have been analyzed.',
    },
    exec: {
      type: 'string',
      valueName: 'tick:command',
      multiple: true,
      description: 'Console command executed when the playback reaches the tick.',
    },
  } satisfies CommandOptions;

  public printHelp() {
    this.printCommandHelp({
      name: WatchCommand.Name,
      description: `${WatchCommand.Description}\nThe game is started with the playback settings of the app. The command returns when the game closes, or right away when the demo is sent to a game already running.`,
      usages: ['<demo-path> [options]'],
      arguments: [
        {
          label: '<demo-path>',
          description: '.dem file, relative or absolute.',
        },
      ],
      options: this.options,
      examples: [
        { description: 'Watch a demo', args: this.helpFormatter.formatExamplePath('Desktop', 'demo.dem') },
        {
          description: 'Watch a demo from tick 12000 focusing on a player',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'demo.dem')} --tick 12000 --focus-player 76561198000000000`,
        },
        {
          description: 'Watch a demo and quit the game at tick 5000',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'demo.dem')} --exec 5000:quit`,
        },
      ],
    });
  }

  public async run() {
    const payload = this.parseArgs();
    const demoName = path.basename(payload.demoPath);
    const client = await this.connectToDaemon();

    output.progress(`Starting the playback of ${demoName}...`);
    try {
      const { hasStartedGame } = await client.send(
        { name: CliClientMessageName.WatchDemo, payload },
        { timeoutMs: null },
      );
      output.clearProgress();
      if (hasStartedGame) {
        output.success(`Counter-Strike closed, playback of ${demoName} ended`);
      } else {
        output.success(`Playback of ${demoName} started in the running Counter-Strike`);
      }
    } catch (error) {
      output.clearProgress();
      throw new CommandError(`Failed to watch ${demoName}`, { cause: error });
    } finally {
      client.close();
    }
  }

  private parseArgs(): WatchDemoPayload {
    const { values, positionals } = this.parseOptions(this.options, { allowPositionals: true });
    if (positionals.length === 0) {
      throw new InvalidArgument('Missing demo path');
    }
    if (positionals.length > 1) {
      // The arguments of an unquoted --exec command end up as extra positionals.
      const hint = values.exec === undefined ? '' : `\nQuote --exec values containing spaces: --exec "100:status 1"`;
      throw new InvalidArgument(`Only one demo can be watched at a time${hint}`);
    }

    const demoPath = path.resolve(positionals[0]);
    if (!demoPath.endsWith('.dem')) {
      throw new InvalidArgument(`Invalid demo path: ${demoPath}`);
    }

    let startTick: number | undefined;
    if (values.tick !== undefined) {
      startTick = Number(values.tick);
      if (!Number.isInteger(startTick) || startTick < 0) {
        throw new InvalidArgument('Tick must be a positive integer');
      }
    }

    return {
      demoPath,
      startTick,
      focusSteamId: values['focus-player'],
      commands: values.exec?.map((value) => this.parseTickCommand(value)),
    };
  }

  private parseTickCommand(value: string): TickCommand {
    const separatorIndex = value.indexOf(':');
    const tick = Number(value.slice(0, separatorIndex));
    const cmd = value.slice(separatorIndex + 1).trim();
    if (separatorIndex < 1 || !Number.isInteger(tick) || tick < 0 || cmd === '') {
      throw new InvalidArgument(`Invalid --exec value "${value}", expected <tick>:<command>`);
    }

    return { tick, cmd };
  }
}
