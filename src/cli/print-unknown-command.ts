import { commands } from './commands';
import { findSimilarCommandName } from './find-similar-command-name';

export function printUnknownCommand(commandName: string) {
  console.error(`Unknown command: ${commandName}`);
  const similarCommandName = findSimilarCommandName(commandName, Object.keys(commands));
  if (similarCommandName) {
    console.error(`Did you mean "csdm ${similarCommandName}"?`);
  }
  console.error('Run "csdm help" for usage.');
}
