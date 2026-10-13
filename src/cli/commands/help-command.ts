import { Command } from './command';
import { commands } from '../commands';
import pkg from '../../../package.json';

export class HelpCommand extends Command {
  public static Name = 'help';
  public static Description = 'Show CLI help usage';

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
  }

  public async run() {
    this.printHelp();

    return Promise.resolve();
  }
}
