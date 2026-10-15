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
import { output } from 'csdm/cli/output';

export class DownloadValveCommand extends DownloadBaseCommand {
  public static Name = 'dl-valve';
  public static Description = 'Download the last MM demos of the current Steam account or from share codes.';
  private readonly shareCodes: string[] = [];

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
      options: this.downloadOptions,
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

    this.outputFolderPath = await this.getOutputFolder();
    await this.assertOutputFolderIsValid(this.outputFolderPath);

    if (this.shareCodes.length > 0) {
      await this.processMatches(this.shareCodes, async (shareCode) => {
        this.printProgress(`Retrieving the match with share code ${shareCode}...`);
        const { matchId, reservationId, tvPort } = decodeMatchShareCode(shareCode);
        const matches = await this.fetchMatches([matchId.toString(), reservationId.toString(), tvPort.toString()]);
        if (matches.length === 0) {
          this.printDownloadError(`Demo link expired for share code: ${shareCode}`);
          return;
        }
        await this.processMatchInfo(matches[0]);
      });
    } else {
      output.progress('Retrieving last MM matches...');
      const matches = await this.fetchMatches();
      output.log(`Found ${matches.length} matches to download`);
      await this.processMatches(matches, (match) => this.processMatchInfo(match));
    }
  }

  protected parseArgs() {
    const { values, positionals } = this.parseOptions(this.downloadOptions, { allowPositionals: true });
    this.parseDownloadOptions(values);
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
      this.printDemoAlreadyDownloaded(demoPath);
      return;
    }

    const demoUrl = lastRoundMessage.map;
    if (demoUrl === undefined) {
      this.printDownloadError(`Demo URL not found for match: ${demoName}`, demoPath);
      return;
    }

    const isDemoLinkExpired = await isDownloadLinkExpired(demoUrl);
    if (isDemoLinkExpired) {
      this.printDownloadError(`Demo link expired: ${demoUrl}`, demoPath);
      return;
    }

    const isDownloaded = await this.downloadDemo(demoUrl, demoPath, b2());
    if (isDownloaded) {
      await fs.writeFile(`${demoPath}.info`, toBinary(CDataGCCStrike15_v2_MatchInfoSchema, matchInfo));
    }
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
}
