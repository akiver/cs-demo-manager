import path from 'node:path';
import { MatchXlsxExport } from 'csdm/node/xlsx/match-xlsx-export';
import { MatchesXlsxExport } from 'csdm/node/xlsx/matches-xlsx-export';
import { SheetName } from 'csdm/node/xlsx/sheet-name';
import { ExportCommand } from './export-command';
import type { CommandOptions } from 'csdm/cli/parse-command-args';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { output } from 'csdm/cli/output';

function isValidSheetName(value: string): value is SheetName {
  return Object.values(SheetName).includes(value as SheetName);
}

export class XlsxCommand extends ExportCommand {
  public static Name = 'xlsx';
  public static Description = 'Export demos into XLSX files.';
  private generateSingleFile = false;
  private sheets: Record<SheetName, boolean> = {
    [SheetName.General]: true,
    [SheetName.Players]: true,
    [SheetName.Rounds]: true,
    [SheetName.Kills]: true,
    [SheetName.Weapons]: true,
    [SheetName.Clutches]: true,
    [SheetName.Utility]: true,
    [SheetName.PlayersFlashbangMatrix]: true,
  };
  private readonly options = {
    ...this.exportOptions,
    single: {
      type: 'boolean',
      description: 'Generate a single XLSX file instead of one per demo.',
    },
    sheets: {
      type: 'string',
      valueName: 'sheets',
      description: `Comma-separated list of the sheets to include, all sheets by default.\nAllowed values: ${Object.values(SheetName).join(', ')}`,
    },
  } satisfies CommandOptions;

  public printHelp() {
    this.printCommandHelp({
      name: XlsxCommand.Name,
      description: XlsxCommand.Description,
      usages: ['<demo-paths...> [options]'],
      arguments: [
        {
          label: '<demo-paths...>',
          description: '.dem files or folders containing .dem files, relative or absolute.',
        },
      ],
      options: this.options,
      examples: [
        { description: 'Export 1 demo', args: this.helpFormatter.formatExamplePath('Desktop', 'demo.dem') },
        {
          description: 'Export multiple demos with only the "rounds" and "kills" sheets',
          args: `${this.helpFormatter.formatExamplePath('Desktop', 'demo.dem')} ${this.helpFormatter.formatExamplePath('Desktop', 'demo2.dem')} --sheets rounds,kills`,
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
  }

  protected async exportMatches() {
    if (this.generateSingleFile) {
      const checksums = this.demosToExport.map((demo) => demo.checksum);
      const outputFilePath = path.join(this.outputFolderPath, `export-${checksums.length}-matches.xlsx`);
      const xlsxExport = new MatchesXlsxExport({
        checksums,
        outputFilePath,
        sheets: this.sheets,
      });
      output.progress(`Exporting ${checksums.length} matches to ${path.basename(outputFilePath)}...`);
      await xlsxExport.generate();
      output.success(`Exported ${checksums.length} matches in ${output.formatPath(outputFilePath)}`);
    } else {
      for (const [index, { checksum, demoName }] of this.demosToExport.entries()) {
        const outputFilePath = path.join(this.outputFolderPath, `${demoName}.xlsx`);
        output.progress(`[${index + 1}/${this.demosToExport.length}] Exporting ${demoName}.xlsx...`);
        const xlsxExport = new MatchXlsxExport({
          checksum,
          outputFilePath,
          sheets: this.sheets,
        });
        await xlsxExport.generate();
      }
      output.success(
        `Exported ${this.demosToExport.length} matches in folder ${output.formatPath(this.outputFolderPath)}`,
      );
    }
  }

  private async parseArgs() {
    const { values, positionals } = this.parseOptions(this.options, { allowPositionals: true });
    await this.parseExportArgs(values, positionals);
    this.generateSingleFile = values.single ?? false;

    if (values.sheets !== undefined) {
      const sheetNames = values.sheets.split(',').map((sheetName) => sheetName.trim());
      for (const sheetName of sheetNames) {
        if (!isValidSheetName(sheetName)) {
          throw new InvalidArgument(
            `Invalid sheet name "${sheetName}", allowed values: ${Object.values(SheetName).join(', ')}`,
          );
        }
      }
      for (const sheetName of Object.values(SheetName)) {
        this.sheets[sheetName] = sheetNames.includes(sheetName);
      }
    }
  }
}
