import { exportMatchesToJson } from 'csdm/node/json/export-matches-to-json';
import { ExportCommand } from './export-command';
import type { CommandOptions } from 'csdm/cli/parse-command-args';

export class JsonCommand extends ExportCommand {
  public static Name = 'json';
  public static Description = 'Export demos into JSON files.';
  private minify = false;
  private readonly options = {
    ...this.exportOptions,
    minify: {
      type: 'boolean',
      description: 'Minify the JSON files.',
    },
  } satisfies CommandOptions;

  public printHelp() {
    this.printCommandHelp({
      name: JsonCommand.Name,
      description: JsonCommand.Description,
      usages: ['<demo-paths...> [options]'],
      arguments: [
        {
          label: '<demo-paths...>',
          description: '.dem files or folders containing .dem files, relative or absolute.',
        },
      ],
      options: this.options,
      examples: [
        {
          description: 'Export 1 demo into a minified JSON file',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'demo.dem')} --minify`,
        },
        {
          description: 'Export all demos in a folder with the ESL analyzer and save the files in a specific folder',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'MyFolder')} --output-folder ${this.helpFormatter.formatExamplePath('Documents')} --source esl`,
        },
      ],
    });
  }

  public async run() {
    await this.parseArgs();
    await super.run();

    const checksums = this.demosToExport.map((demo) => demo.checksum);
    const options = {
      outputFolderPath: this.outputFolderPath,
      checksums,
      minify: this.minify,
    };
    try {
      await exportMatchesToJson(options);
      console.log(`Exported ${this.demosToExport.length} matches in folder ${this.outputFolderPath}`);
    } catch (error) {
      console.log('Error while exporting matches to JSON');
    }
  }

  protected async parseArgs() {
    const { values, positionals } = this.parseOptions(this.options, { allowPositionals: true });
    await this.parseExportArgs(values, positionals);
    this.minify = values.minify ?? false;
  }
}
