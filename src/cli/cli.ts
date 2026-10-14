import './cli-setup';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import { commands } from './commands';
import { HelpCommand } from './commands/help-command';
import { getErrorMessage, isExpectedError } from 'csdm/cli/get-error-message';
import { printUnknownCommand } from 'csdm/cli/print-unknown-command';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { ExitCode } from 'csdm/cli/exit-code';
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
  const args = process.argv.slice(2);
  if (args[0] === '--version') {
    console.log(pkg.version);
    process.exit(ExitCode.Success);
  }

  const commandName = getCommandName(args);
  try {
    const CommandToRun = commands[commandName];
    if (CommandToRun === undefined) {
      printUnknownCommand(commandName);
      process.exit(ExitCode.InvalidUsage);
    }

    const commandArgs = process.argv.slice(3);
    const command = new CommandToRun(commandArgs);
    await command.run();
    process.exit(ExitCode.Success);
  } catch (error) {
    if (error instanceof InvalidArgument) {
      console.error(error.message);
      console.error(`Run "csdm ${commandName} --help" for usage.`);
      process.exit(ExitCode.InvalidUsage);
    }

    if (isExpectedError(error)) {
      console.error(getErrorMessage(error));
    } else {
      // Likely a bug, the stack trace helps to report it.
      console.error(error);
    }
    process.exit(ExitCode.Failure);
  }
}

void main();
