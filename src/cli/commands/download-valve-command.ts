import fs from 'fs-extra';
import { request } from 'undici';
import { pipeline } from 'node:stream';
import path from 'node:path';
import b2 from 'unbzip2-stream';
import util from 'node:util';
import { decodeMatchShareCode, InvalidShareCode } from 'csgo-sharecode';
import { startBoiler } from 'csdm/node/boiler/start-boiler';
import {
  type CDataGCCStrike15_v2_MatchInfo,
  type WatchableMatchInfo,
  CDataGCCStrike15_v2_MatchInfoSchema,
  toBinary,
} from 'csgo-protobuf';
import { SteamCommunicationError } from 'csdm/node/boiler/errors/steam-communication-error';
import { AlreadyConnected } from 'csdm/node/boiler/errors/already-connected';
import { SteamRestartRequired } from 'csdm/node/boiler/errors/steam-restart-required';
import { BoilerSteamNotRunning } from 'csdm/node/boiler/errors/boiler-steam-not-running';
import { UserNotConnected } from 'csdm/node/boiler/errors/user-not-connected';
import { NoMatchesFound } from 'csdm/node/boiler/errors/no-matches-found';
import { WriteFileError } from 'csdm/node/boiler/errors/write-file-error';
import { InvalidArgs } from 'csdm/node/boiler/errors/invalid-args';
import { MatchesInfoFileNotFound } from 'csdm/node/boiler/errors/matches-info-file-not-found';
import {
  buildMatchName,
  getLastRoundStatsMessage,
} from 'csdm/node/valve-match/get-valve-match-from-match-info-protobuf-message';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { DownloadBaseCommand } from './download-base-command';
import { InvalidArgument } from 'csdm/cli/errors/invalid-argument';
import { SteamNotRunning } from 'csdm/node/counter-strike/launcher/errors/steam-not-running';
const streamPipeline = util.promisify(pipeline);

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
          console.log('Demo link expired.');
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
      console.log('Demo URL not found');
      return;
    }

    const isDemoLinkExpired = await isDownloadLinkExpired(demoUrl);
    if (isDemoLinkExpired) {
      console.log(`Demo link expired ${demoUrl}`);
      return;
    }

    const response = await request(demoUrl, { method: 'GET' });
    if (!response.body) {
      console.log('Request error');
      return;
    }

    this.demoPathBeingDownloaded = demoPath;
    const out = fs.createWriteStream(demoPath);
    await streamPipeline(response.body, b2(), out);
    await fs.writeFile(`${demoPath}.info`, toBinary(CDataGCCStrike15_v2_MatchInfoSchema, matchInfo));
    this.demoPathBeingDownloaded = undefined;
  }

  private async fetchMatches(args?: string[]) {
    try {
      const { matches } = await startBoiler({
        args,
      });

      return matches;
    } catch (error) {
      let message = 'An error occurred retrieving matches.';
      switch (true) {
        case error instanceof InvalidArgs:
          message = 'Invalid arguments provided to boiler.';
          break;
        case error instanceof MatchesInfoFileNotFound:
          message = 'Matches info file not found.';
          break;
        case error instanceof SteamCommunicationError:
          message =
            'Error while contacting Steam, make sure your Steam account is not currently in-game on another device, otherwise please retry later.';
          break;
        case error instanceof AlreadyConnected:
          message = 'You are already connected to the CS game coordinator, make sure to close CS and retry.';
          break;
        case error instanceof SteamRestartRequired:
          message = 'Steam needs to be restarted.';
          break;
        case error instanceof SteamNotRunning:
        case error instanceof BoilerSteamNotRunning:
          message = 'Steam is not running or the current account is not logged in.';
          break;
        case error instanceof UserNotConnected:
          message = 'Steam account not connected.';
          break;
        case error instanceof NoMatchesFound:
          return [];
        case error instanceof WriteFileError:
          message = 'An error occurred while writing matches file.';
          break;
      }

      console.error(message);

      return [];
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
