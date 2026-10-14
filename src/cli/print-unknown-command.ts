import { commands } from './commands';
import { findSimilarName } from './find-similar-name';

export function printUnknownCommand(commandName: string) {
  console.error(`Unknown command: ${commandName}`);
  const similarCommandName = findSimilarName(commandName, Object.keys(commands));
  if (similarCommandName) {
    console.error(`Did you mean "csdm ${similarCommandName}"?`);
  }
  console.error('Run "csdm help" for usage.');
}
