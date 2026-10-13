import './cli-setup';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import { commands } from './commands';
import { HelpCommand } from './commands/help-command';
import { isErrorCode } from 'csdm/common/is-error-code';
import { getErrorCodeMessage } from 'csdm/cli/get-error-code-message';
import { printUnknownCommand } from 'csdm/cli/print-unknown-command';
import pkg from '../../package.json' with { type: 'json' };

function getCommandName(args: string[]) {
  if (args.length === 0) {
    return HelpCommand.Name;
  }

  const [firstArg] = args;
  if (firstArg === '--help' || firstArg === '-h') {
    return HelpCommand.Name;
  }

  return firstArg;
}

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args[0] === '--version') {
      console.log(pkg.version);
      process.exit(0);
    }

    const commandName = getCommandName(args);
    const CommandToRun = commands[commandName];
    if (CommandToRun === undefined) {
      printUnknownCommand(commandName);
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
