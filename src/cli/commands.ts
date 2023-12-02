import { AnalyzeCommand } from './commands/analyze-command';
import { DownloadValveCommand } from './commands/download-valve-command';
import { DownloadFaceitCommand } from './commands/download-faceit-command';
import { HelpCommand } from './commands/help-command';
import { XlsxCommand } from './commands/xlsx-command';

export const commands = {
  [AnalyzeCommand.Name]: AnalyzeCommand,
  [DownloadFaceitCommand.Name]: DownloadFaceitCommand,
  [DownloadValveCommand.Name]: DownloadValveCommand,
  [HelpCommand.Name]: HelpCommand,
  [XlsxCommand.Name]: XlsxCommand,
};
