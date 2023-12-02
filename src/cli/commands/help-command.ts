import { Command } from './command';
import { commands } from '../commands';
import pkg from '../../../package.json';

export class HelpCommand extends Command {
  public static Name = 'help';

  public getDescription() {
    return 'Show CLI help usage';
  }

  public printHelp() {
    console.log(`CS Demo Manager ${pkg.version}`);
    console.log('');
    console.log('\tUsage: csdm <command> [arguments]');
    console.log('');
    console.log('The commands are:');
    console.log('');
    for (const [commandName, CommandToRun] of Object.entries(commands)) {
      const command = new CommandToRun([]);
      console.log(`\t${commandName.padEnd(10)} \t${command.getDescription()}`);
    }
  }

  public async run() {
    this.printHelp();

    return Promise.resolve();
  }
}
