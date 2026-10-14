import fs from 'fs-extra';
import path from 'node:path';
import b2 from 'unbzip2-stream';
import { decodeMatchShareCode, InvalidShareCode } from 'csgo-sharecode';
import { startBoiler } from 'csdm/node/boiler/start-boiler';
import {
  type CDataGCCStrike15_v2_MatchInfo,
  type WatchableMatchInfo,
  CDataGCCStrike15_v2_MatchInfoSchema,
  toBinary,
} from 'csgo-protobuf';
import { NoMatchesFound } from 'csdm/node/boiler/errors/no-matches-found';
import {
  buildMatchName,
  getLastRoundStatsMessage,
} from 'csdm/node/valve-match/get-valve-match-from-match-info-protobuf-message';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { DownloadBaseCommand } from './download-base-command';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { CommandError } from 'csdm/cli/errors/command-error';

export class DownloadValveCommand extends DownloadBaseCommand {
  public static Name = 'dl-valve';
  public static Description = 'Download the last MM demos of the current Steam account or from share codes.';
  private readonly shareCodes: string[] = [];
  private demoPathBeingDownloaded: string | undefined;

  public printHelp() {
    this.printCommandHelp({
      name: DownloadValveCommand.Name,
      description: DownloadValveCommand.Description,
      usages: ['[share-codes...] [options]'],
      arguments: [
        {
          label: '[share-codes...]',
          description:
            'Share codes of the matches to download, the last MM matches of the current Steam account by default.',
        },
      ],
      options: this.outputOption,
      examples: [
        { description: 'Download the last MM demos of the current Steam account', args: '' },
        {
          description: 'Download demos from share codes',
          args: 'CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
        },
        {
          description: 'Download demos in a specific folder',
          args: `--output ${this.helpFormatter.formatExamplePath('Downloads')}`,
        },
      ],
    });
  }

  public async run() {
    this.parseArgs();
    process.on('SIGINT', this.onInterruptSignal);

    this.outputFolderPath = await this.getOutputFolder();
    await this.assertOutputFolderIsValid(this.outputFolderPath);

    if (this.shareCodes.length > 0) {
      for (const shareCode of this.shareCodes) {
        console.log(`Downloading match with share code ${shareCode}...`);
        const { matchId, reservationId, tvPort } = decodeMatchShareCode(shareCode);
        const matches = await this.fetchMatches([matchId.toString(), reservationId.toString(), tvPort.toString()]);
        if (matches.length === 0) {
          this.printDownloadError(`Demo link expired for share code: ${shareCode}`);
          continue;
        }
        await this.processMatchInfo(matches[0]);
      }
    } else {
      console.log('Retrieving last MM matches...');
      const matches = await this.fetchMatches();
      if (matches.length === 0) {
        console.log('No matches found.');
        return;
      }

      for (const [index, match] of matches.entries()) {
        console.log(`Downloading match ${index + 1}/${matches.length}...`);
        await this.processMatchInfo(match);
      }
    }
    this.exitIfDownloadFailed();
  }

  protected parseArgs() {
    const { values, positionals } = this.parseOptions(this.outputOption, { allowPositionals: true });
    this.outputFolderPath = values.output ?? '';
    for (const shareCode of positionals) {
      try {
        decodeMatchShareCode(shareCode);
        this.shareCodes.push(shareCode);
      } catch (error) {
        if (error instanceof InvalidShareCode) {
          throw new InvalidArgument(`Invalid share code: ${shareCode}`);
        }
        throw error;
      }
    }
  }

  private async processMatchInfo(matchInfo: CDataGCCStrike15_v2_MatchInfo) {
    const watchInfo = matchInfo.watchablematchinfo as WatchableMatchInfo;
    const tvPort = watchInfo.tvPort as number;
    const serverIp = watchInfo.serverIp as number;
    const lastRoundMessage = getLastRoundStatsMessage(matchInfo);
    const lastRoundReservationId = lastRoundMessage.reservationid as bigint;

    const demoName = buildMatchName(lastRoundReservationId, tvPort, serverIp);
    const demoPath = path.join(this.outputFolderPath, `${demoName}.dem`);
    const demoAlreadyExists = await fs.pathExists(demoPath);
    if (demoAlreadyExists) {
      console.log(`Demo already exists at ${demoPath}`);
      return;
    }

    const demoUrl = lastRoundMessage.map;
    if (demoUrl === undefined) {
      this.printDownloadError(`Demo URL not found for match: ${demoName}`);
      return;
    }

    const isDemoLinkExpired = await isDownloadLinkExpired(demoUrl);
    if (isDemoLinkExpired) {
      this.printDownloadError(`Demo link expired: ${demoUrl}`);
      return;
    }

    this.demoPathBeingDownloaded = demoPath;
    const isDownloaded = await this.downloadDemo(demoUrl, demoPath, b2());
    if (isDownloaded) {
      await fs.writeFile(`${demoPath}.info`, toBinary(CDataGCCStrike15_v2_MatchInfoSchema, matchInfo));
    }
    this.demoPathBeingDownloaded = undefined;
  }

  private async fetchMatches(args?: string[]) {
    try {
      const { matches } = await startBoiler({
        args,
      });

      return matches;
    } catch (error) {
      if (error instanceof NoMatchesFound) {
        return [];
      }

      throw new CommandError('Failed to retrieve the matches', { cause: error });
    }
  }

  private onInterruptSignal = async () => {
    if (this.demoPathBeingDownloaded) {
      await fs.remove(this.demoPathBeingDownloaded);
      await fs.remove(`${this.demoPathBeingDownloaded}.info`);
    }
    this.exit();
  };
}
