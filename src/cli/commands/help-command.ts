import { Command } from './command';
import { commands } from '../commands';
import { printUnknownCommand } from '../print-unknown-command';
import { ExitCode } from '../exit-code';
import type { CommandOptions } from '../parse-command-args';
import pkg from '../../../package.json';

export class HelpCommand extends Command {
  public static Name = 'help';
  public static Description = 'Show CLI help usage, or the help of a command.';

  public printHelp() {
    const commandRows = Object.entries(commands).map(([commandName, CommandToRun]) => {
      return { label: commandName, description: CommandToRun.Description };
    });

    console.log(`CS Demo Manager ${pkg.version}`);
    console.log('');
    console.log('Usage:');
    console.log('  csdm <command> [arguments] [options]');
    console.log('');
    console.log(this.helpFormatter.formatRowsSection('Commands', commandRows));
    console.log('');
    const options: CommandOptions = {
      ...this.globalOptions,
      help: { type: 'boolean', short: 'h', description: 'Show the help of a command.' },
    };
    console.log(this.helpFormatter.formatOptionsSection('Options available for all commands', options));
    console.log('');
    console.log('Run "csdm help <command>" or "csdm <command> --help" for more information about a command.');
    console.log('Run "csdm --version" to print the version.');
  }

  public run() {
    const [commandName] = this.args;
    const CommandToRun = commandName === undefined ? HelpCommand : commands[commandName];
    if (CommandToRun === undefined) {
      printUnknownCommand(commandName);
      return this.exit(ExitCode.InvalidUsage);
    }

    new CommandToRun([]).printHelp();

    return Promise.resolve();
  }
}
