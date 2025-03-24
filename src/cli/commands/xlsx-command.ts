import path from 'node:path';
import { SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { MatchXlsxExport } from 'csdm/node/xlsx/match-xlsx-export';
import { MatchesXlsxExport } from 'csdm/node/xlsx/matches-xlsx-export';
import { SheetName } from 'csdm/node/xlsx/sheet-name';
import { ExportCommand } from './export-command';

export class XlsxCommand extends ExportCommand {
  public static Name = 'xlsx';
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
  private singleFlag = '--single';
  private sheetsFlag = '--sheets';

  public getDescription() {
    return 'Export demos into XLSX files.';
  }

  public printHelp() {
    const sourceValues = SupportedDemoSources.join(',');
    console.log(this.getDescription());
    console.log('');
    console.log(
      `Usage: csdm ${XlsxCommand.Name} demoPaths... ${this.commonFlags.map((flag) => `[${flag}]`)} [${this.singleFlag}] [${this.sheetsFlag}]`,
    );
    console.log('');
    console.log('Demos path can be either a .dem files path or a directory. It can be relative or absolute.');
    console.log(`The ${this.outputFolderFlag} flag specify the directory where output files will be saved.`);
    console.log(
      `The ${this.sourceFlag} flag forces the analysis logic of the demo analyzer. Available values: [${sourceValues}]`,
    );
    console.log(`The ${this.singleFlag} flag generates a single XLSX file instead of one per demo.`);
    console.log(
      `The ${this.sheetsFlag} flag includes only sheets identified by its name. Available values: [${Object.values(
        SheetName,
      ).join(',')}]`,
    );
    console.log(`The ${this.forceAnalyzeFlag} flag forces demos analyzes even if they are already in the database.`);
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('Export 1 demo:');
    console.log(`    csdm ${XlsxCommand.Name} "C:\\Users\\username\\Desktop\\demo.dem"`);
    console.log('');
    console.log('Export multiple demos with only the "Rounds" and "Kills" sheets:');
    console.log(
      `    csdm ${XlsxCommand.Name} "C:\\Users\\username\\Desktop\\demo.dem" "C:\\Users\\username\\Desktop\\demo2.dem" ${this.sheetsFlag} rounds,kills`,
    );
    console.log('');
    console.log('Export all demos in a directory using the ESL analyzer and save it in a custom directory:');
    console.log(
      `    csdm ${XlsxCommand.Name} "C:\\Users\\username\\Desktop\\MyFolder" ${this.outputFolderFlag} "C:\\Users\\username\\Documents" ${this.sourceFlag} esl`,
    );
  }

  public async run() {
    await this.parseArgs();
    await super.run();

    if (this.generateSingleFile) {
      const checksums = this.demosToExport.map((demo) => demo.checksum);
      const outputFilePath = path.join(this.outputFolderPath, `export-${checksums.length}-matches.xlsx`);
      const xlsxExport = new MatchesXlsxExport({
        checksums,
        outputFilePath,
        sheets: this.sheets,
      });
      await xlsxExport.generate();
      console.log(`Exported ${checksums.length} matches in ${outputFilePath}`);
    } else {
      for (const { checksum, demoName } of this.demosToExport) {
        const outputFilePath = path.join(this.outputFolderPath, `${demoName}.xlsx`);
        const xlsxExport = new MatchXlsxExport({
          checksum,
          outputFilePath,
          sheets: this.sheets,
        });
        await xlsxExport.generate();
      }
      console.log(`Exported ${this.demosToExport.length} matches in folder ${this.outputFolderPath}`);
    }
  }

  protected async parseArgs() {
    await super.parseArgs();

    for (let index = 0; index < this.args.length; index++) {
      const arg = this.args[index];
      if (!this.isFlagArgument(arg)) {
        continue;
      }

      switch (arg) {
        case this.singleFlag:
          this.generateSingleFile = true;
          break;
        case this.sheetsFlag:
          if (this.args.length > index + 1) {
            index += 1;
            for (const sheetName in this.sheets) {
              this.sheets[sheetName as SheetName] = false;
            }

            const sheetNames = this.args[index].split(',');
            for (const sheetName of sheetNames) {
              if (!Object.values(SheetName).includes(sheetName as SheetName)) {
                console.log(`Invalid sheet name "${sheetName}"`);
                console.log(`Available values: ${Object.values(SheetName).join(',')}`);
                this.exitWithFailure();
              }

              this.sheets[sheetName as SheetName] = true;
            }
          } else {
            console.log(`Missing ${this.sheetsFlag} value`);
            this.exitWithFailure();
          }
          break;
        default:
          if (!super.isCommonFlag(arg)) {
            console.log(`Unknown flag: ${arg}`);
            this.exitWithFailure();
          }
      }
    }
  }
}
