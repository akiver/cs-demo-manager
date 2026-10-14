import { commands } from './commands';
import { findSimilarName } from './find-similar-name';
import { output } from './output';

export function printUnknownCommand(commandName: string) {
  const lines = [`Unknown command: ${commandName}`];
  const similarCommandName = findSimilarName(commandName, Object.keys(commands));
  if (similarCommandName) {
    lines.push(`Did you mean "csdm ${similarCommandName}"?`);
  }
  output.error(lines.join('\n'));
  output.hint('Run "csdm help" for usage.');
}
