import './cli-setup';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import { commands } from './commands';
import { HelpCommand } from './commands/help-command';
import { isErrorCode } from 'csdm/common/is-error-code';
import { getErrorCodeMessage } from 'csdm/cli/get-error-code-message';

async function main() {
  try {
    const args = process.argv.slice(2);
    const commandName = args.length > 0 ? args[0] : HelpCommand.Name;
    const CommandToRun = commands[commandName];
    if (CommandToRun === undefined) {
      console.log(`${commandName}: unknown command`);
      console.log('Run csdm for usage.');
      process.exit(1);
    }

    const commandArgs = process.argv.slice(3);
    const command = new CommandToRun(commandArgs);
    await command.run();
    process.exit(0);
  } catch (error) {
    if (isErrorCode(error)) {
      console.error(getErrorCodeMessage(error));
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

void main();
