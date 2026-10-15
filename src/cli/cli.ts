import './cli-setup';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import { commands } from './commands';
import { HelpCommand } from './commands/help-command';
import { getErrorMessage, getErrorStack, isExpectedError } from 'csdm/cli/get-error-message';
import { printUnknownCommand } from 'csdm/cli/print-unknown-command';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { ExitCode } from 'csdm/cli/exit-code';
import { output } from 'csdm/cli/output';
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

async function exit(exitCode?: ExitCode) {
  await output.flush();
  // Without exit code, the one set by the command with process.exitCode is used.
  process.exit(exitCode);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--version') {
    console.log(pkg.version);
    return exit(ExitCode.Success);
  }

  const commandName = getCommandName(args);
  try {
    const CommandToRun = commands[commandName];
    if (CommandToRun === undefined) {
      printUnknownCommand(commandName);
      return await exit(ExitCode.InvalidUsage);
    }

    const commandArgs = process.argv.slice(3);
    const command = new CommandToRun(commandArgs);
    await command.run();
    return await exit();
  } catch (error) {
    if (error instanceof InvalidArgument) {
      output.error(error.message);
      output.hint(`Run "csdm ${commandName} --help" for usage.`);
      return exit(ExitCode.InvalidUsage);
    }

    if (isExpectedError(error)) {
      output.error(getErrorMessage(error));
      output.debug(getErrorStack(error));
    } else {
      // Likely a bug, the stack trace helps to report it.
      output.clearProgress();
      console.error(error);
    }

    return exit(ExitCode.Failure);
  }
}

void main();
