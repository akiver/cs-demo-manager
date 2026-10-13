import { Command } from './command';
import { commands } from '../commands';
import { printUnknownCommand } from '../print-unknown-command';
import pkg from '../../../package.json';

export class HelpCommand extends Command {
  public static Name = 'help';
  public static Description = 'Show CLI help usage, or the help of a command.';

  public printHelp() {
    console.log(`CS Demo Manager ${pkg.version}`);
    console.log('');
    console.log('\tUsage: csdm <command> [arguments]');
    console.log('');
    console.log('The commands are:');
    console.log('');
    for (const [commandName, CommandToRun] of Object.entries(commands)) {
      console.log(`\t${commandName.padEnd(10)} \t${CommandToRun.Description}`);
    }
    console.log('');
    console.log('Run "csdm help <command>" or "csdm <command> --help" for more information about a command.');
    console.log('Run "csdm --version" to print the version.');
  }

  public run() {
    const [commandName] = this.args;
    const CommandToRun = commandName === undefined ? HelpCommand : commands[commandName];
    if (CommandToRun === undefined) {
      printUnknownCommand(commandName);
      return this.exitWithFailure();
    }

    new CommandToRun([]).printHelp();

    return Promise.resolve();
  }
}
