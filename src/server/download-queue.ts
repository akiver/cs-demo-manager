import fs from 'fs-extra';
import { pipeline } from 'node:stream';
import { Client, interceptors } from 'undici';
import b2 from 'unbzip2-stream';
import unzipper from 'unzipper';
import zlib from 'node:zlib';
import path from 'node:path';
import util from 'node:util';
import { assertDownloadFolderIsValid } from 'csdm/node/download/assert-download-folder-is-valid';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import { loadDemoByPath } from 'csdm/node/demo/load-demo-by-path';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import type { Download, DownloadDemoProgressPayload } from 'csdm/common/download/download-types';
import { DownloadSource } from 'csdm/common/download/download-types';
import { MatchAlreadyInDownloadQueue } from 'csdm/node/download/errors/match-already-in-download-queue';
import { MatchAlreadyDownloaded } from 'csdm/node/download/errors/match-already-downloaded';
import { DownloadLinkExpired } from 'csdm/node/download/errors/download-link-expired';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';
import { WriteDemoInfoFileError } from 'csdm/node/download/errors/write-info-file-error';
import { insertDownloadHistory } from 'csdm/node/database/download-history/insert-download-history';
import { InvalidDemoHeader } from 'csdm/node/demo/errors/invalid-demo-header';
import { insertDemos } from 'csdm/node/database/demos/insert-demos';
const streamPipeline = util.promisify(pipeline);

class DownloadDemoQueue {
  private downloads: Download[] = [];
  private currentDownload: Download | undefined;
  private abortControllersPerMatchId: { [matchId: string]: AbortController | undefined } = {};

  public addDownload = async (download: Download) => {
    const downloadFolderPath = await this.getDownloadFolderPath();

    if (this.isMatchAlreadyInQueue(download.matchId)) {
      throw new MatchAlreadyInDownloadQueue();
    }

    if (await this.isMatchAlreadyDownloaded(downloadFolderPath, download)) {
      throw new MatchAlreadyDownloaded();
    }

    const downloadLinkExpired = await isDownloadLinkExpired(download.demoUrl);
    if (downloadLinkExpired) {
      throw new DownloadLinkExpired();
    }

    this.downloads.push(download);

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.DownloadsAdded,
      payload: [download],
    });

    this.loopUntilDownloadsDone();
  };

  public addDownloads = async (downloads: Download[]) => {
    if (downloads.length === 0) {
      return [];
    }

    const downloadFolderPath = await this.getDownloadFolderPath();

    const validDownloads: Download[] = [];
    for (const download of downloads) {
      const isAlreadyInQueue = this.isMatchAlreadyInQueue(download.matchId);
      if (isAlreadyInQueue) {
        continue;
      }

      const isAlreadyDownloaded = await this.isMatchAlreadyDownloaded(downloadFolderPath, download);
      if (isAlreadyDownloaded) {
        continue;
      }

      const downloadLinkExpired = await isDownloadLinkExpired(download.demoUrl);
      if (downloadLinkExpired) {
        continue;
      }

      validDownloads.push(download);
    }

    if (validDownloads.length === 0) {
      return [];
    }

    this.downloads.push(...validDownloads);

    this.loopUntilDownloadsDone();

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.DownloadsAdded,
      payload: validDownloads,
    });

    return validDownloads;
  };

  public getDownloads = () => {
    const downloads: Download[] = [];
    for (const download of this.downloads) {
      downloads.push(download);
    }
    if (this.currentDownload !== undefined) {
      downloads.push(this.currentDownload);
    }

    return downloads;
  };

  public abortDownload(matchId: string) {
    const controller = this.abortControllersPerMatchId[matchId];
    if (controller !== undefined) {
      controller.abort();
    }

    this.abortControllersPerMatchId[matchId] = undefined;
    this.downloads = this.downloads.filter((download) => download.matchId !== matchId);
    if (this.currentDownload?.matchId === matchId) {
      this.currentDownload = undefined;
    }
  }

  public abortDownloads() {
    for (const controller of Object.values(this.abortControllersPerMatchId)) {
      controller?.abort();
    }

    this.abortControllersPerMatchId = {};
    this.downloads = [];
    this.currentDownload = undefined;
  }

  private async loopUntilDownloadsDone() {
    if (this.downloads.length === 0 || this.currentDownload !== undefined) {
      return;
    }

    try {
      this.currentDownload = this.downloads.shift();
      await this.processCurrentDownload();
    } finally {
      this.loopUntilDownloadsDone();
    }
  }

  private readonly processCurrentDownload = async () => {
    if (this.currentDownload === undefined) {
      return;
    }

    const currentDownload = this.currentDownload;
    if (!currentDownload.demoUrl) {
      return;
    }

    const downloadFolderPath = await this.getDownloadFolderPath();
    const controller = new AbortController();
    this.abortControllersPerMatchId[currentDownload.matchId] = controller;

    const demoPath = this.buildDemoPath(downloadFolderPath, currentDownload.fileName);
    const infoPath = this.buildDemoInfoFilePath(demoPath);
    try {
      const url = new URL(currentDownload.demoUrl);
      const client = new Client(url.origin).compose(interceptors.redirect({ maxRedirections: 1 }));
      const response = await client.request({
        path: url.pathname,
        signal: controller.signal,
        method: 'GET',
      });
      if (response.statusCode === 404) {
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.DownloadDemoExpired,
          payload: currentDownload.matchId,
        });
        return;
      }

      if (!response.body) {
        throw new Error('Error on request');
      }

      let receivedBytes = 0;
      let totalBytes = 1;

      const contentLength = response.headers['content-length'] as string;
      if (contentLength !== null) {
        totalBytes = Number.parseInt(contentLength, 10);
      }

      let currentProgress = 0;
      response.body.on('data', (chunk) => {
        receivedBytes += chunk.length;
        const progress = receivedBytes / totalBytes;
        // Send progress messages only every 1% to reduce messages
        if (progress - currentProgress >= 0.01 || progress === 1) {
          const payload: DownloadDemoProgressPayload = {
            matchId: currentDownload.matchId,
            progress,
          };
          server.sendMessageToRendererProcess({
            name: RendererServerMessageName.DownloadDemoProgress,
            payload,
          });
          currentProgress = progress;
        }
      });

      const out = fs.createWriteStream(demoPath);
      let transformStream: NodeJS.WritableStream;
      const { demoUrl } = currentDownload;
      if (demoUrl.endsWith('.gz')) {
        transformStream = zlib.createGunzip();
      } else if (demoUrl.endsWith('.bz2')) {
        transformStream = b2();
      } else if (demoUrl.endsWith('.zip')) {
        transformStream = unzipper.ParseOne();
      } else {
        throw new Error('Unsupported demo archive');
      }

      await streamPipeline(response.body, transformStream, out);
      if (currentDownload.source === DownloadSource.Valve) {
        const { protobufBytes } = currentDownload.match;
        if (protobufBytes !== undefined) {
          await this.writeMatchInfoFile(protobufBytes, infoPath);
        }
      }

      const demo = await getDemoFromFilePath(demoPath);
      // for non-Valve demos, we update the demo's date with the one coming from the third-party API and insert it into
      // the database so that the date will be more accurate.
      // for Valve demos, the date is retrieved from the proto .info file.
      if (currentDownload.source !== DownloadSource.Valve) {
        demo.date = currentDownload.match.date;
        await insertDemos([demo]);
      }
      await insertDownloadHistory(currentDownload.matchId);

      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.DownloadDemoSuccess,
        payload: {
          demoChecksum: demo.checksum,
          download: currentDownload,
        },
      });

      const settings = await getSettings();
      const currentDemosFolderPath = settings.demos.currentFolderPath;
      if (currentDemosFolderPath === downloadFolderPath) {
        await this.loadDownloadedDemo(demoPath);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        logger.error(error);
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.DownloadDemoError,
          payload: currentDownload.matchId,
        });
      }
      if (error instanceof InvalidDemoHeader) {
        logger.error('Invalid demo header from downloaded demo');
        logger.error(error);
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.DownloadDemoCorrupted,
          payload: currentDownload.matchId,
        });
      }
      await fs.remove(demoPath);
      await fs.remove(infoPath);
    } finally {
      this.currentDownload = undefined;
    }
  };

  private writeMatchInfoFile = async (protobufBytes: Uint8Array, infoFilePath: string) => {
    try {
      // ! Sending an Uint8Array through WebSocket with JSON.stringify() becomes an object.
      // ! The Uint8Array creation is important to write a valid binary file, TS is not aware of this transformation.
      const bytes = new Uint8Array(Object.values(protobufBytes));
      await fs.writeFile(infoFilePath, bytes);
    } catch (error) {
      logger.error('Error while writing .info file');
      logger.error(error);
      throw new WriteDemoInfoFileError();
    }
  };

  private async getDownloadFolderPath() {
    await assertDownloadFolderIsValid();
    const settings = await getSettings();
    const downloadFolderPath = settings.download.folderPath;

    return downloadFolderPath as string;
  }

  private isMatchAlreadyInQueue(matchId: string): boolean {
    return (
      this.currentDownload?.matchId === matchId ||
      this.downloads.some((download) => {
        return download.matchId === matchId;
      })
    );
  }

  private isMatchAlreadyDownloaded = async (downloadFolderPath: string, download: Download) => {
    const demoPath = this.buildDemoPath(downloadFolderPath, download.fileName);
    const demoFileExists = await fs.pathExists(demoPath);
    if (!demoFileExists) {
      return false;
    }

    if (download.source === DownloadSource.Valve) {
      const infoPath = this.buildDemoInfoFilePath(demoPath);
      const infoFileExists = await fs.pathExists(infoPath);

      return infoFileExists;
    }

    return true;
  };

  private buildDemoPath(downloadFolderPath: string, fileName: string) {
    const demoPath = path.join(downloadFolderPath, `${fileName}.dem`);

    return demoPath;
  }

  private buildDemoInfoFilePath(demoPath: string) {
    return `${demoPath}.info`;
  }

  private loadDownloadedDemo = async (demoPath: string) => {
    try {
      const demo = await loadDemoByPath(demoPath);
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.DownloadDemoInCurrentFolderLoaded,
        payload: demo,
      });
    } catch (error) {
      logger.error('Error while loading downloaded demo');
      logger.error(error);
    }
  };
}

export const downloadDemoQueue = new DownloadDemoQueue();
