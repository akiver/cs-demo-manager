import { SupportedDemoSources } from 'csdm/common/types/counter-strike';
import { exportMatchesToJson } from 'csdm/node/json/export-matches-to-json';
import { ExportCommand } from './export-command';

export class JsonCommand extends ExportCommand {
  public static Name = 'json';
  private minify = false;
  private minifyFlag = '--minify';

  public getDescription() {
    return 'Export demos into JSON files.';
  }

  public printHelp() {
    const sourceValues = SupportedDemoSources.join(',');
    console.log(this.getDescription());
    console.log('');
    console.log(
      `Usage: csdm ${JsonCommand.Name} demoPaths... ${this.formatFlagsForHelp(this.commonFlags)} ${this.formatFlagForHelp(this.minifyFlag)}`,
    );
    console.log('');
    console.log('Demos path can be either a .dem files path or a directory. It can be relative or absolute.');
    console.log(`The ${this.outputFolderFlag} flag specify the directory where output files will be saved.`);
    console.log(
      `The ${this.sourceFlag} flag forces the analysis logic of the demo analyzer. Available values: [${sourceValues}]`,
    );
    console.log(`The ${this.forceAnalyzeFlag} flag force demos analyzes even if they are already in the database.`);
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('Export 1 demo into a minified JSON file:');
    console.log(`    csdm ${JsonCommand.Name} "C:\\Users\\username\\Desktop\\demo.dem" ${this.minifyFlag}`);
    console.log('');
    console.log('Export all demos in a directory using the ESL analyzer and save it in a custom directory:');
    console.log(
      `    csdm ${JsonCommand.Name} "C:\\Users\\username\\Desktop\\MyFolder" ${this.outputFolderFlag} "C:\\Users\\username\\Documents" ${this.sourceFlag} esl`,
    );
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
    await super.parseArgs();

    for (let index = 0; index < this.args.length; index++) {
      const arg = this.args[index];
      if (!this.isFlagArgument(arg)) {
        continue;
      }

      switch (arg) {
        case this.minifyFlag:
          this.minify = true;
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
