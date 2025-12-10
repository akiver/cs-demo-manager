import { AnalyzeCommand } from './commands/analyze-command';
import { DownloadValveCommand } from './commands/download-valve-command';
import { DownloadFaceitCommand } from './commands/download-faceit-command';
import { HelpCommand } from './commands/help-command';
import { XlsxCommand } from './commands/xlsx-command';
import { JsonCommand } from './commands/json-command';
import { VideoCommand } from './commands/video-command';
import { DownloadRenownCommand } from './commands/download-renown-command';
import { Download5EPlayCommand } from './commands/download-5eplay-command';

export const commands = {
  [AnalyzeCommand.Name]: AnalyzeCommand,
  [DownloadFaceitCommand.Name]: DownloadFaceitCommand,
  [DownloadValveCommand.Name]: DownloadValveCommand,
  [DownloadRenownCommand.Name]: DownloadRenownCommand,
  [Download5EPlayCommand.Name]: Download5EPlayCommand,
  [HelpCommand.Name]: HelpCommand,
  [JsonCommand.Name]: JsonCommand,
  [XlsxCommand.Name]: XlsxCommand,
  [VideoCommand.Name]: VideoCommand,
};
